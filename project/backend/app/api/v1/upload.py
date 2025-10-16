from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from app.api.deps import get_current_user_id
from app.services.storage_service import StorageService
from app.services.syft_service import SyftService
from app.services.sbom_service import SBOMService
from app.core.database import get_supabase_client
from app.core.config import settings
from supabase import Client
import tempfile
import os


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
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{filename}") as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        syft_service = SyftService()
        sbom_data = await syft_service.generate_sbom(temp_path)
        
        components = syft_service.parse_cyclonedx_components(sbom_data)
        
        platform = syft_service.detect_platform_from_sbom(sbom_data)
        
        sbom_service = SBOMService(supabase_client)
        await sbom_service.update_application_sbom(app_id, sbom_data, components, platform)
        
        os.unlink(temp_path)
        
        print(f"Background processing completed for {app_id}")
        
    except Exception as e:
        print(f"Background processing failed: {str(e)}")
        supabase_client.table("applications").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", app_id).execute()


@router.post("/")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    storage_service: StorageService = Depends(get_storage_service),
    sbom_service: SBOMService = Depends(get_sbom_service),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        upload_result = await storage_service.upload_file(
            file_content,
            file.filename,
            user_id
        )
        
        app_id = await sbom_service.store_application(
            user_id=user_id,
            filename=file.filename,
            file_size=upload_result["file_size"],
            file_hash=upload_result["file_hash"],
            storage_path=upload_result["storage_path"]
        )
        
        background_tasks.add_task(
            process_sbom_background,
            app_id,
            file_content,
            file.filename,
            supabase_client
        )
        
        return {
            "message": "File uploaded successfully. SBOM generation in progress.",
            "application_id": app_id,
            "filename": file.filename,
            "file_size": file_size,
            "status": "processing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
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
    
    try:
        response = supabase_client.table("applications").select(
            "id, name, status, error_message, component_count, analyzed_at"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )