"""
Storage service for file uploads to Supabase Storage.
Fixed with increased timeout for large files.
"""

from supabase import Client
from app.core.config import settings
import hashlib
from typing import Optional
import httpx


class StorageService:
    """Service for handling file storage operations."""
    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
        self.bucket = settings.STORAGE_BUCKET
        
        # CRITICAL FIX: Increase timeout for large file uploads
        # Create a custom httpx client with longer timeout
        timeout = httpx.Timeout(
            timeout=300.0,  # 5 minutes total timeout
            connect=60.0,   # 1 minute to establish connection
            read=300.0,     # 5 minutes to read response
            write=300.0     # 5 minutes to write (upload) - THIS IS KEY!
        )
        
        # Update the storage client's httpx client with new timeout
        if hasattr(self.client.storage, '_client'):
            self.client.storage._client.timeout = timeout
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        """Calculate SHA256 hash of file content."""
        return hashlib.sha256(file_content).hexdigest()
    
    async def upload_file(
        self, 
        file_content: bytes, 
        filename: str, 
        user_id: str
    ) -> dict:
        """
        Upload file to Supabase Storage with extended timeout.
        """
        try:
            print(f"  Storage: Calculating file hash...")
            file_hash = self.calculate_file_hash(file_content)
            
            # Organize files by user: uploads/{user_id}/{file_hash}_{filename}
            file_path = f"{user_id}/{file_hash}_{filename}"
            
            print(f"  Storage: Uploading {len(file_content)/(1024*1024):.2f}MB to {file_path}...")
            
            # Just catch duplicate and ignore - file already in storage is fine
            try:
                response = self.client.storage.from_(self.bucket).upload(
                    path=file_path,
                    file=file_content,
                    file_options={"content-type": "application/octet-stream"}
                )
                print(f"  Storage: Upload complete!")
            except Exception as e:
                if "Duplicate" in str(e) or "already exists" in str(e):
                    print(f"  Storage: File already exists in storage, reusing...")
                    # File exists in storage - that's OK, we'll check user ownership in database
                else:
                    raise  # Re-raise if it's not a duplicate error
            
            return {
                "file_path": file_path,
                "file_hash": file_hash,
                "file_size": len(file_content),
                "storage_path": f"{self.bucket}/{file_path}"
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"  Storage: Upload failed - {error_msg}")
            
            # Provide helpful error messages
            if "timeout" in error_msg.lower():
                raise Exception(
                    f"File upload timed out. File size: {len(file_content)/(1024*1024):.1f}MB. "
                    f"Consider using a faster connection."
                )
            elif "size" in error_msg.lower():
                raise Exception(f"File too large: {len(file_content)/(1024*1024):.1f}MB")
            else:
                raise Exception(f"File upload failed: {error_msg}")
    
    async def download_file(self, file_path: str) -> bytes:
        """Download file from Supabase Storage."""
        try:
            response = self.client.storage.from_(self.bucket).download(file_path)
            return response
        except Exception as e:
            raise Exception(f"File download failed: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from Supabase Storage."""
        try:
            self.client.storage.from_(self.bucket).remove([file_path])
            return True
        except Exception as e:
            print(f"File deletion failed: {str(e)}")
            return False
    
    def get_signed_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Get signed URL for temporary file access.
        
        Args:
            file_path: Path to file in storage
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Signed URL string
        """
        try:
            response = self.client.storage.from_(self.bucket).create_signed_url(
                file_path, 
                expires_in
            )
            return response['signedURL']
        except Exception as e:
            raise Exception(f"Failed to generate signed URL: {str(e)}")