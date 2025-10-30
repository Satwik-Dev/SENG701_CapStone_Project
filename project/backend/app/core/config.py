from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Project Info
    PROJECT_NAME: str = "SBOM Manager API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    DATABASE_URL: str
    
    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Storage Configuration
    STORAGE_BUCKET: str = "uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB in bytes

    # Email Configuration (SMTP)
    SMTP_EMAIL: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    RECIPIENT_EMAIL: Optional[str] = None

    # Email settings
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"
    RESEND_TO_EMAIL: str = ""
    
    # CORS Configuration (for frontend)
    #ALLOWED_ORIGINS: list[str] = [
    #    "http://localhost:5173",  # Vite dev server
    #    "https://*.vercel.app",  # prod server
    #    "http://localhost:3000",  # Alternative React port
    #    "http://127.0.0.1:5173",
    #    "http://127.0.0.1:3000",
    #]
    
    class Config:
        # Look for .env file in parent directory (project/)
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()


# Print loaded config (for debugging - remove in production)
if settings.DEBUG:
    print("Configuration loaded successfully!")
    print(f"Project: {settings.PROJECT_NAME}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Supabase URL: {settings.SUPABASE_URL}")
    print(f"Storage Bucket: {settings.STORAGE_BUCKET}")
    print(f"Max File Size: {settings.MAX_FILE_SIZE / (1024*1024):.0f}MB")