from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.api.deps import get_current_user_id
from app.core.database import get_supabase_client
from supabase import Client
from typing import Optional, Dict, List, Any
from collections import defaultdict

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("/overview")
async def get_stats_overview(
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Get comprehensive statistics overview for the user's SBOMs.
    Returns stats grouped by category, OS, supplier, manufacturer, platform, and binary type.
    """
    try:
        # Fetch all user applications (only completed ones for accurate stats)
        apps_response = supabase_client.table("applications").select(
            "id, name, platform, os, category, supplier, manufacturer, "
            "binary_type, status, component_count, sbom_format, created_at"
        ).eq("user_id", user_id).execute()
        
        apps = apps_response.data or []
        
        # Filter to completed apps for stats (but show all in total)
        completed_apps = [app for app in apps if app.get('status') == 'completed']
        
        if not apps:
            return {
                "total_applications": 0,
                "total_completed": 0,
                "total_components": 0,
                "avg_components_per_app": 0,
                "by_category": [],
                "by_operating_system": [],
                "by_supplier": [],
                "by_manufacturer": [],
                "by_platform": [],
                "by_binary_type": [],
                "by_status": []
            }
        
        # Calculate totals
        total_apps = len(apps)
        total_completed = len(completed_apps)
        total_components = sum(app.get('component_count', 0) or 0 for app in completed_apps)
        
        # Group by Category
        by_category = _group_and_count(completed_apps, 'category')
        
        # Group by Operating System (use 'os' field, fallback to 'platform')
        by_os = _group_and_count_os(completed_apps)
        
        # Group by Supplier
        by_supplier = _group_and_count(completed_apps, 'supplier')
        
        # Group by Manufacturer
        by_manufacturer = _group_and_count(completed_apps, 'manufacturer')
        
        # Group by Platform
        by_platform = _group_and_count(completed_apps, 'platform')
        
        # Group by Binary Type
        by_binary_type = _group_and_count(completed_apps, 'binary_type')
        
        # Group by Status (all apps)
        by_status = _group_and_count(apps, 'status')
        
        return {
            "total_applications": total_apps,
            "total_completed": total_completed,
            "total_components": total_components,
            "avg_components_per_app": round(total_components / total_completed, 1) if total_completed > 0 else 0,
            "by_category": by_category,
            "by_operating_system": by_os,
            "by_supplier": by_supplier,
            "by_manufacturer": by_manufacturer,
            "by_platform": by_platform,
            "by_binary_type": by_binary_type,
            "by_status": by_status
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


@router.get("/by-category")
async def get_stats_by_category(
    category: Optional[str] = Query(None, description="Filter by specific category"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get detailed statistics for applications grouped by category."""
    return await _get_grouped_stats(supabase_client, user_id, 'category', category)


@router.get("/by-os")
async def get_stats_by_operating_system(
    os: Optional[str] = Query(None, description="Filter by specific OS"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get detailed statistics for applications grouped by operating system."""
    return await _get_grouped_stats(supabase_client, user_id, 'platform', os)


@router.get("/by-supplier")
async def get_stats_by_supplier(
    supplier: Optional[str] = Query(None, description="Filter by specific supplier"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get detailed statistics for applications grouped by supplier."""
    return await _get_grouped_stats(supabase_client, user_id, 'supplier', supplier)


@router.get("/by-manufacturer")
async def get_stats_by_manufacturer(
    manufacturer: Optional[str] = Query(None, description="Filter by specific manufacturer"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get detailed statistics for applications grouped by manufacturer."""
    return await _get_grouped_stats(supabase_client, user_id, 'manufacturer', manufacturer)


@router.get("/component-types")
async def get_component_type_stats(
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get distribution of component types, licenses, and languages across all user's applications."""
    try:
        # Get all user's completed application IDs
        apps_response = supabase_client.table("applications").select(
            "id"
        ).eq("user_id", user_id).eq("status", "completed").execute()
        
        if not apps_response.data:
            return {
                "by_type": [],
                "by_license": [],
                "by_language": [],
                "total_components": 0
            }
        
        app_ids = [app['id'] for app in apps_response.data]
        
        # Get all components for these applications
        components_response = supabase_client.table("application_components").select(
            "components(type, license, language)"
        ).in_("application_id", app_ids).execute()
        
        # Count by type, license, and language
        type_counts = defaultdict(int)
        license_counts = defaultdict(int)
        language_counts = defaultdict(int)
        
        for item in components_response.data or []:
            comp = item.get('components', {})
            if comp:
                # Count by type
                comp_type = comp.get('type') or 'unknown'
                type_counts[comp_type] += 1
                
                # Count by license
                license_val = comp.get('license') or 'Unknown'
                license_counts[license_val] += 1
                
                # Count by language
                lang = comp.get('language') or 'Unknown'
                language_counts[lang] += 1
        
        return {
            "by_type": [
                {"name": k, "count": v} 
                for k, v in sorted(type_counts.items(), key=lambda x: -x[1])
            ],
            "by_license": [
                {"name": k, "count": v} 
                for k, v in sorted(license_counts.items(), key=lambda x: -x[1])[:20]  # Top 20
            ],
            "by_language": [
                {"name": k, "count": v} 
                for k, v in sorted(language_counts.items(), key=lambda x: -x[1])
            ],
            "total_components": sum(type_counts.values())
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch component statistics: {str(e)}"
        )


@router.get("/timeline")
async def get_timeline_stats(
    days: int = Query(30, ge=7, le=365, description="Number of days to include"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get application creation timeline for the specified number of days."""
    from datetime import datetime, timedelta
    
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Fetch applications within date range
        apps_response = supabase_client.table("applications").select(
            "id, created_at, status, component_count"
        ).eq("user_id", user_id).gte(
            "created_at", start_date.isoformat()
        ).execute()
        
        apps = apps_response.data or []
        
        # Group by date
        daily_counts = defaultdict(lambda: {"apps": 0, "components": 0})
        
        for app in apps:
            created_at = app.get('created_at', '')[:10]  # Get date part only
            daily_counts[created_at]["apps"] += 1
            if app.get('status') == 'completed':
                daily_counts[created_at]["components"] += app.get('component_count', 0) or 0
        
        # Create timeline with all dates (fill gaps with zeros)
        timeline = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            data = daily_counts.get(date_str, {"apps": 0, "components": 0})
            timeline.append({
                "date": date_str,
                "applications": data["apps"],
                "components": data["components"]
            })
            current_date += timedelta(days=1)
        
        return {
            "timeline": timeline,
            "total_days": days,
            "total_applications": sum(d["applications"] for d in timeline),
            "total_components": sum(d["components"] for d in timeline)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch timeline: {str(e)}"
        )


# ============ Helper Functions ============

def _group_and_count(apps: List[Dict], field: str) -> List[Dict]:
    """Group applications by a field and count occurrences."""
    counts = defaultdict(lambda: {"count": 0, "total_components": 0})
    
    for app in apps:
        value = app.get(field)
        if value is None or value == '':
            value = "Unspecified"
        counts[value]["count"] += 1
        counts[value]["total_components"] += app.get('component_count', 0) or 0
    
    return [
        {
            "name": k, 
            "count": v["count"], 
            "total_components": v["total_components"]
        }
        for k, v in sorted(counts.items(), key=lambda x: -x[1]["count"])
    ]


def _group_and_count_os(apps: List[Dict]) -> List[Dict]:
    """Group applications by OS, using 'os' field or falling back to 'platform'."""
    counts = defaultdict(lambda: {"count": 0, "total_components": 0})
    
    for app in apps:
        # Use 'os' if available and not empty, otherwise use 'platform'
        value = app.get('os')
        if not value or value == '':
            value = app.get('platform')
        if not value or value == '':
            value = "Unknown"
        
        counts[value]["count"] += 1
        counts[value]["total_components"] += app.get('component_count', 0) or 0
    
    return [
        {
            "name": k, 
            "count": v["count"], 
            "total_components": v["total_components"]
        }
        for k, v in sorted(counts.items(), key=lambda x: -x[1]["count"])
    ]


async def _get_grouped_stats(
    supabase_client: Client,
    user_id: str,
    group_field: str,
    filter_value: Optional[str] = None
) -> Dict[str, Any]:
    """Get detailed stats with optional filtering by a specific value."""
    try:
        query = supabase_client.table("applications").select(
            "id, name, platform, os, category, supplier, manufacturer, "
            "binary_type, component_count, created_at, status"
        ).eq("user_id", user_id).eq("status", "completed")
        
        if filter_value:
            query = query.eq(group_field, filter_value)
        
        response = query.execute()
        apps = response.data or []
        
        grouped = _group_and_count(apps, group_field)
        
        return {
            "group_field": group_field,
            "filter_value": filter_value,
            "total_applications": len(apps),
            "total_components": sum(app.get('component_count', 0) or 0 for app in apps),
            "groups": grouped,
            "applications": apps if filter_value else []  # Only return app list when filtered
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch grouped statistics: {str(e)}"
        )