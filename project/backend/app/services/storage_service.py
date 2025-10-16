"""
Storage service for file uploads to Supabase Storage.
"""

from supabase import Client
from app.core.config import settings
import hashlib
from typing import Optional


class StorageService:
    """Service for handling file storage operations."""
    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
        self.bucket = settings.STORAGE_BUCKET
    
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
        Upload file to Supabase Storage.
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            user_id: User ID for organizing files
            
        Returns:
            Dict with file path and metadata
        """
        try:
            # Calculate file hash for deduplication
            file_hash = self.calculate_file_hash(file_content)
            
            # Organize files by user: uploads/{user_id}/{file_hash}_{filename}
            file_path = f"{user_id}/{file_hash}_{filename}"
            
            # Upload to Supabase Storage
            response = self.client.storage.from_(self.bucket).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": "application/octet-stream"}
            )
            
            return {
                "file_path": file_path,
                "file_hash": file_hash,
                "file_size": len(file_content),
                "storage_path": f"{self.bucket}/{file_path}"
            }
            
        except Exception as e:
            raise Exception(f"File upload failed: {str(e)}")
    
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
        """Get signed URL for temporary file access."""
        try:
            response = self.client.storage.from_(self.bucket).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            return response.get("signedURL", "")
        except Exception as e:
            raise Exception(f"Failed to generate signed URL: {str(e)}")