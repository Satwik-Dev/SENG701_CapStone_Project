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
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            user_id: User ID for organizing files
            
        Returns:
            Dict with file path and metadata
        """
        try:
            print(f"  Storage: Calculating file hash...")
            # Calculate file hash for deduplication
            file_hash = self.calculate_file_hash(file_content)
            
            # Organize files by user: uploads/{user_id}/{file_hash}_{filename}
            file_path = f"{user_id}/{file_hash}_{filename}"
            
            print(f"  Storage: Uploading {len(file_content)/(1024*1024):.2f}MB to {file_path}...")
            print(f"  Storage: This may take a few minutes for large files...")
            
            # Upload to Supabase Storage with increased timeout
            response = self.client.storage.from_(self.bucket).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": "application/octet-stream"}
            )
            
            print(f"  Storage: Upload complete!")
            
            return {
                "file_path": file_path,
                "file_hash": file_hash,
                "file_size": len(file_content),
                "storage_path": f"{self.bucket}/{file_path}"
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"  Storage: Upload failed - {error_msg}")
            
            # Provide more helpful error messages
            if "timeout" in error_msg.lower():
                raise Exception(
                    f"File upload timed out. This can happen with large files on slow connections. "
                    f"File size: {len(file_content)/(1024*1024):.1f}MB. "
                    f"Consider using a faster internet connection or splitting the file."
                )
            elif "too large" in error_msg.lower() or "size" in error_msg.lower():
                raise Exception(
                    f"File too large for storage. "
                    f"Supabase free tier limit is 50MB per file. "
                    f"Your file: {len(file_content)/(1024*1024):.1f}MB"
                )
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