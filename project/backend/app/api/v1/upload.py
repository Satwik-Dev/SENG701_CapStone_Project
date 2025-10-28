from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from app.api.deps import get_current_user_id
from app.services.storage_service import StorageService
from app.services.syft_service import SyftService
from app.services.sbom_service import SBOMService
from app.core.database import get_supabase_client
from app.core.config import settings
from supabase import Client
from concurrent.futures import ThreadPoolExecutor
import tempfile
import os
import traceback
import asyncio
import threading


router = APIRouter(prefix="/upload", tags=["Upload"])


def get_storage_service(
    supabase_client: Client = Depends(get_supabase_client)
) -> StorageService:
    return StorageService(supabase_client)


def get_sbom_service(
    supabase_client: Client = Depends(get_supabase_client)
) -> SBOMService:
    return SBOMService(supabase_client)


async def process_sbom_background(
    app_id: str,
    file_content: bytes,
    filename: str,
    supabase_client: Client
):
    """
    Background task to process SBOM.
    """
    temp_path = None
    
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{filename}") as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        print(f"Processing file: {filename} (size: {len(file_content)} bytes)")
        
        # Initialize services
        syft_service = SyftService()
        sbom_service = SBOMService(supabase_client)
        
        # Detect platform from filename first (more reliable)
        platform = syft_service.detect_platform_from_file(filename)
        print(f"Detected platform from filename: {platform}")
        
        # Generate BOTH SBOMs
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            cyclonedx_data, spdx_data = await loop.run_in_executor(
                executor, 
                lambda: syft_service.generate_sbom_sync(temp_path)
            )
        
        # Parse components from CycloneDX
        components = syft_service.parse_cyclonedx_components(cyclonedx_data)
        
        # If platform is still unknown, try detecting from SBOM content
        if platform == "unknown":
            platform = syft_service.detect_platform_from_sbom(cyclonedx_data)
            print(f"Detected platform from SBOM content: {platform}")
        
        # Store SBOM with BOTH formats
        await sbom_service.update_application_sbom(
            app_id, 
            cyclonedx_data, 
            spdx_data,
            components, 
            platform
        )
        
        # Clean up
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        
        print(f"✅ Background processing completed for {app_id}")
        
    except Exception as e:
        print(f"❌ Background processing failed: {str(e)}")
        print(f"❌ Full traceback: {traceback.format_exc()}")
        
        # Update status to failed
        try:
            supabase_client.table("applications").update({
                "status": "failed",
                "error_message": str(e)
            }).eq("id", app_id).execute()
        except Exception as db_error:
            print(f"❌ Failed to update DB: {str(db_error)}")
        
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    storage_service: StorageService = Depends(get_storage_service),
    sbom_service: SBOMService = Depends(get_sbom_service),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Upload file with streaming support for large files.
    
    Supports:
    - Mobile: .apk (Android), .ipa (iOS)
    - Desktop: .exe (Windows), .app (macOS), .deb/.rpm (Linux)
    - Source Code: .zip, .tar, .tar.gz, .tgz
    
    Maximum file size: 50MB
    
    If the file has been uploaded before (based on hash), reuses existing SBOM data.
    """
    
    temp_upload_path = None
    
    try:
        print(f"\n{'='*60}")
        print(f"🔵 UPLOAD REQUEST RECEIVED")
        print(f"{'='*60}")
        
        # Validate filename
        if not file.filename:
            print("❌ ERROR: No filename provided")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename is required"
            )
        
        print(f"Filename: {file.filename}")
        print(f"Content-Type: {file.content_type}")
        print(f"User ID: {user_id}")
        
        # Stream file to disk to avoid memory issues with large files
        print(f"📖 Streaming file to disk...")
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_upload_{file.filename}") as temp_upload:
                temp_upload_path = temp_upload.name
                
                # Write in chunks to avoid memory issues
                chunk_size = 1024 * 1024  # 1MB chunks
                file_size = 0
                while chunk := await file.read(chunk_size):
                    temp_upload.write(chunk)
                    file_size += len(chunk)
                    if file_size % (5 * 1024 * 1024) == 0:  # Log every 5MB
                        print(f"  Streamed {file_size / (1024*1024):.1f} MB...")
            
            print(f"✅ File streamed successfully: {file_size} bytes ({file_size/(1024*1024):.2f} MB)")
            
        except Exception as read_error:
            print(f"❌ ERROR streaming file: {str(read_error)}")
            print(f"❌ Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to read file: {str(read_error)}"
            )
        
        # Validate file size
        if file_size == 0:
            print("❌ ERROR: File is empty")
            if temp_upload_path and os.path.exists(temp_upload_path):
                os.unlink(temp_upload_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        if file_size > settings.MAX_FILE_SIZE:
            print(f"❌ ERROR: File too large ({file_size} > {settings.MAX_FILE_SIZE})")
            if temp_upload_path and os.path.exists(temp_upload_path):
                os.unlink(temp_upload_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        # Read file content for storage upload
        print(f"📂 Reading file for storage upload...")
        with open(temp_upload_path, 'rb') as f:
            file_content = f.read()
        
        # Detect platform from filename
        print(f"🔍 Detecting platform...")
        try:
            syft_service = SyftService()
            platform = syft_service.detect_platform_from_file(file.filename)
            print(f"✅ Platform detected: {platform}")
        except Exception as platform_error:
            print(f"⚠️  Platform detection failed: {str(platform_error)}")
            platform = "unknown"
        
        # Upload to storage
        print(f"☁️  Uploading to Supabase Storage...")
        try:
            upload_result = await storage_service.upload_file(
                file_content,
                file.filename,
                user_id
            )
            print(f"✅ File uploaded: {upload_result['storage_path']}")
        except Exception as storage_error:
            print(f"❌ ERROR uploading to storage: {str(storage_error)}")
            print(f"❌ Full traceback: {traceback.format_exc()}")
            if temp_upload_path and os.path.exists(temp_upload_path):
                os.unlink(temp_upload_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Storage upload failed: {str(storage_error)}"
            )
        
        # Create application record or get existing one
        print(f"💾 Checking for existing application or creating new record...")
        try:
            # MODIFIED: Now returns tuple (app_id, is_new)
            app_id, is_new = await sbom_service.store_application(
                user_id=user_id,
                filename=file.filename,
                file_size=upload_result["file_size"],
                file_hash=upload_result["file_hash"],
                storage_path=upload_result["storage_path"],
                platform=platform
            )
            print(f"✅ Application {'created' if is_new else 'found existing'}: {app_id}")
        except Exception as db_error:
            print(f"❌ ERROR creating database record: {str(db_error)}")
            print(f"❌ Full traceback: {traceback.format_exc()}")
            if temp_upload_path and os.path.exists(temp_upload_path):
                os.unlink(temp_upload_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_error)}"
            )
        
        # MODIFIED: Only start background processing if this is a new file
        if is_new:
            print(f"🚀 Starting background SBOM generation for new file...")
            try:
                def run_background():
                    asyncio.run(process_sbom_background(
                        app_id, file_content, file.filename, supabase_client
                    ))
                
                thread = threading.Thread(target=run_background, daemon=True)
                thread.start()
                print(f"✅ Background task started in separate thread")
            except Exception as bg_error:
                print(f"⚠️  Background task failed to queue: {str(bg_error)}")
        else:
            print(f"♻️  Using existing SBOM data, no background processing needed")
        
        # Clean up temp upload file
        if temp_upload_path and os.path.exists(temp_upload_path):
            try:
                os.unlink(temp_upload_path)
                print(f"🗑️  Temp file cleaned up")
            except:
                pass
        
        print(f"{'='*60}")
        print(f"✅ UPLOAD SUCCESSFUL")
        print(f"{'='*60}\n")
        
        # MODIFIED: Enhanced response with duplicate info
        return {
            "message": "File uploaded successfully." + 
                       (" SBOM generation in progress." if is_new else " Using existing SBOM data."),
            "application_id": app_id,
            "filename": file.filename,
            "file_size": file_size,
            "platform": platform,
            "status": "processing" if is_new else "completed",
            "is_duplicate": not is_new,
            "reused_existing": not is_new
        }
        
    except HTTPException:
        # Clean up temp file on HTTP errors
        if temp_upload_path and os.path.exists(temp_upload_path):
            try:
                os.unlink(temp_upload_path)
            except:
                pass
        raise
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"❌ UPLOAD FAILED - UNHANDLED EXCEPTION")
        print(f"{'='*60}")
        print(f"Error: {str(e)}")
        print(f"Type: {type(e).__name__}")
        print(f"Full traceback:")
        print(traceback.format_exc())
        print(f"{'='*60}\n")
        
        # Clean up temp file
        if temp_upload_path and os.path.exists(temp_upload_path):
            try:
                os.unlink(temp_upload_path)
            except:
                pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/status/{app_id}")
async def get_upload_status(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Check upload/processing status.
    """
    
    try:
        response = supabase_client.table("applications").select(
            "id, name, status, error_message, component_count, analyzed_at, platform"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Status check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )