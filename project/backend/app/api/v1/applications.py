from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_current_user_id
from app.core.database import get_supabase_client
from supabase import Client
from typing import Optional
import json


router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("/")
async def list_applications(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    platform: Optional[str] = None,
    status: Optional[str] = None,
    binary_type: Optional[str] = Query(None),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        query = supabase_client.table("applications").select(
            "id, name, version, platform, status, component_count, file_size, "
            "created_at, analyzed_at, binary_type, os, manufacturer, supplier, sbom_format",
            count="exact"
        ).eq("user_id", user_id)
        
        if platform:
            query = query.eq("platform", platform)
        
        if status:
            query = query.eq("status", status)
        
        if binary_type:
            query = query.eq("binary_type", binary_type)
        
        offset = (page - 1) * limit
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        response = query.execute()
        
        total = response.count if hasattr(response, 'count') else len(response.data)
        total_pages = (total + limit - 1) // limit
        
        return {
            "items": response.data,
            "total": total,
            "page": page,
            "page_size": limit,
            "total_pages": total_pages
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications: {str(e)}"
        )


@router.get("/{app_id}")
async def get_application(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        response = supabase_client.table("applications").select(
            "*"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        app_data = response.data[0]
        
        components_response = supabase_client.table("application_components").select(
            "components(id, name, version, type, language, license, purl, description)"
        ).eq("application_id", app_id).execute()
        
        components = []
        for item in components_response.data:
            if item.get("components"):
                components.append(item["components"])
        
        app_data["components"] = components
        
        return app_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch application: {str(e)}"
        )


@router.get("/{app_id}/components")
async def get_application_components(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        app_response = supabase_client.table("applications").select(
            "id"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not app_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        components_response = supabase_client.table("application_components").select(
            "components(id, name, version, type, language, license, purl, description, supplier, homepage)"
        ).eq("application_id", app_id).execute()
        
        components = []
        for item in components_response.data:
            if item.get("components"):
                components.append(item["components"])
        
        return {
            "application_id": app_id,
            "components": components,
            "total_components": len(components)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch components: {str(e)}"
        )


@router.get("/{app_id}/export")
async def export_sbom(
    app_id: str,
    format: str = Query("cyclonedx", regex="^(cyclonedx|spdx)$"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Export SBOM in requested format (CycloneDX or SPDX).
    """
    
    try:
        response = supabase_client.table("applications").select(
            "sbom_data, spdx_data, name, sbom_format"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        app_data = response.data[0]
        
        if format == "cyclonedx":
            sbom_data = app_data.get("sbom_data")
        elif format == "spdx":
            sbom_data = app_data.get("spdx_data")
        else:
            sbom_data = app_data.get("sbom_data")
        
        if not sbom_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"SBOM data in {format} format not available for this application"
            )
        
        return sbom_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export SBOM: {str(e)}"
        )


@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        app_response = supabase_client.table("applications").select(
            "storage_path"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not app_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        storage_path = app_response.data[0].get("storage_path")
        
        supabase_client.table("application_components").delete().eq(
            "application_id", app_id
        ).execute()
        
        supabase_client.table("applications").delete().eq(
            "id", app_id
        ).execute()
        
        if storage_path:
            try:
                file_path = storage_path.replace("uploads/", "")
                supabase_client.storage.from_("uploads").remove([file_path])
            except Exception as e:
                print(f"Failed to delete file from storage: {str(e)}")
        
        return {
            "message": "Application deleted successfully",
            "application_id": app_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete application: {str(e)}"
        )