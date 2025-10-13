"""
Pydantic models for SBOM applications.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class PlatformEnum(str, Enum):
    """Supported platforms."""
    IOS = "ios"
    ANDROID = "android"
    WINDOWS = "windows"
    MACOS = "macos"
    LINUX = "linux"
    UNKNOWN = "unknown"


class BinaryTypeEnum(str, Enum):
    """Binary types."""
    MOBILE = "mobile"
    DESKTOP = "desktop"
    SERVER = "server"
    UNKNOWN = "unknown"


class StatusEnum(str, Enum):
    """Processing status."""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SBOMFormatEnum(str, Enum):
    """SBOM format types."""
    SPDX = "spdx"
    CYCLONEDX = "cyclonedx"


class ComponentBase(BaseModel):
    """Base component model."""
    name: str
    version: Optional[str] = None
    type: Optional[str] = None
    language: Optional[str] = None
    license: Optional[str] = None
    purl: Optional[str] = None


class ComponentResponse(ComponentBase):
    """Component response model."""
    id: str
    description: Optional[str] = None
    supplier: Optional[str] = None
    author: Optional[str] = None
    homepage: Optional[str] = None
    repository_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationBase(BaseModel):
    """Base application model."""
    name: str
    version: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[PlatformEnum] = None
    binary_type: Optional[BinaryTypeEnum] = None
    category: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    """Model for creating application (from file upload)."""
    pass


class ApplicationResponse(ApplicationBase):
    """Application response model."""
    id: str
    os: Optional[str] = None
    supplier: Optional[str] = None
    manufacturer: Optional[str] = None
    original_filename: str
    file_size: int
    file_hash: Optional[str] = None
    sbom_format: Optional[SBOMFormatEnum] = None
    component_count: int = 0
    status: StatusEnum
    error_message: Optional[str] = None
    user_id: str
    created_at: datetime
    analyzed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ApplicationDetail(ApplicationResponse):
    """Detailed application with components."""
    components: List[ComponentResponse] = []
    sbom_data: Optional[Dict[str, Any]] = None


class ApplicationList(BaseModel):
    """Paginated list of applications."""
    items: List[ApplicationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SBOMExport(BaseModel):
    """Model for SBOM export."""
    format: SBOMFormatEnum = SBOMFormatEnum.CYCLONEDX