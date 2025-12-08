"""
Vulnerability API Endpoints for SBOM Manager
RESTful endpoints for vulnerability detection and management
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_current_user_id
from app.services.vulnerability_service import VulnerabilityService
from app.models.vulnerability import (
    VulnerabilityScanRequest,
    VulnerabilityScanResult,
    VulnerabilityResponse,
    VulnerabilitySummary,
    ComponentWithVulnerabilities,
    VulnerabilityStats,
    VulnerabilityNotification,
    SeverityEnum
)
from app.core.config import settings


router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])


def get_vulnerability_service() -> VulnerabilityService:
    """Dependency to get vulnerability service instance."""
    nvd_api_key = getattr(settings, 'NVD_API_KEY', None)
    return VulnerabilityService(nvd_api_key=nvd_api_key)


@router.post("/scan/{application_id}", response_model=dict)
async def scan_application(
    application_id: str,
    scan_request: VulnerabilityScanRequest = VulnerabilityScanRequest(),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user_id: str = Depends(get_current_user_id),
    vuln_service: VulnerabilityService = Depends(get_vulnerability_service)
):
    """
    Scan an application for vulnerabilities.
    
    This endpoint initiates a vulnerability scan that queries the NVD database
    for known CVEs affecting the application's components.
    
    **Scan Process:**
    - Retrieves all components from the application's SBOM
    - Queries NVD API for each component
    - Matches component versions against vulnerable version ranges
    - Stores vulnerability information and generates summary
    
    **Rate Limiting:**
    - Without API key: 10 requests per minute (6-second delay between components)
    - With API key: 100 requests per minute (0.6-second delay)
    
    **Parameters:**
    - `application_id`: UUID of the application to scan
    - `scan_request`: Optional scan configuration
        - `scan_type`: FULL or INCREMENTAL (default: FULL)
        - `force_refresh`: Force refresh from NVD (default: false)
    
    **Returns:**
    - `scan_id`: Unique identifier for this scan
    - `status`: PENDING (scan queued) or COMPLETED (scan finished)
    - `message`: Status message
    
    **Example Response:**
    ```json
    {
        "scan_id": "123e4567-e89b-12d3-a456-426614174000",
        "status": "PENDING",
        "message": "Vulnerability scan initiated"
    }
    ```
    """
    try:
        # Verify user owns this application
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        app_result = client.table("applications")\
            .select("id")\
            .eq("id", application_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not app_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Start scan (can be done in background for large applications)
        result = await vuln_service.scan_application_vulnerabilities(
            application_id,
            force_refresh=scan_request.force_refresh
        )
        
        return {
            "scan_id": result["scan_id"],
            "status": result["status"],
            "vulnerabilities_found": result["vulnerabilities_found"],
            "message": "Vulnerability scan completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/{application_id}/summary", response_model=VulnerabilitySummary)
async def get_vulnerability_summary(
    application_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get vulnerability summary for an application.
    
    Returns aggregated vulnerability counts by severity level.
    
    **Returns:**
    - Counts by severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
    - Total vulnerability count
    - Highest CVSS score found
    - Last scan timestamp
    - Current scan status
    
    **Example Response:**
    ```json
    {
        "application_id": "123e4567-e89b-12d3-a456-426614174000",
        "critical_count": 2,
        "high_count": 5,
        "medium_count": 12,
        "low_count": 8,
        "info_count": 0,
        "total_count": 27,
        "highest_cvss_score": 9.8,
        "last_scanned_at": "2024-12-08T10:30:00Z",
        "scan_status": "COMPLETED"
    }
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # Verify ownership
        app_result = client.table("applications")\
            .select("id")\
            .eq("id", application_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not app_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get summary
        result = client.table("application_vulnerability_summary")\
            .select("*")\
            .eq("application_id", application_id)\
            .execute()
        
        if not result.data:
            # Return empty summary if no scan has been performed
            return VulnerabilitySummary(
                application_id=application_id,
                critical_count=0,
                high_count=0,
                medium_count=0,
                low_count=0,
                info_count=0,
                total_count=0,
                scan_status="PENDING"
            )
        
        return VulnerabilitySummary(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{application_id}/details")
async def get_vulnerability_details(
    application_id: str,
    severity: Optional[List[SeverityEnum]] = Query(None),
    user_id: str = Depends(get_current_user_id),
    vuln_service: VulnerabilityService = Depends(get_vulnerability_service)
):
    """
    Get detailed vulnerability information for an application.
    
    Returns complete vulnerability data including CVE details, CVSS scores,
    and affected components.
    
    **Query Parameters:**
    - `severity`: Optional filter by severity levels (can specify multiple)
        - Example: `?severity=CRITICAL&severity=HIGH`
    
    **Returns:**
    - Vulnerability summary
    - Detailed list of vulnerabilities with:
        - CVE information
        - CVSS scores and severity
        - Affected components
        - Version ranges
        - References and CWE IDs
    
    **Example Response:**
    ```json
    {
        "summary": {
            "critical_count": 2,
            "high_count": 5,
            ...
        },
        "vulnerabilities": [
            {
                "id": "vuln-uuid",
                "cve_id": "CVE-2024-12345",
                "description": "Buffer overflow vulnerability...",
                "cvss_v3_score": 9.8,
                "cvss_v3_severity": "CRITICAL",
                "components": [
                    {
                        "name": "openssl",
                        "version": "1.1.1",
                        ...
                    }
                ]
            }
        ]
    }
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # Verify ownership
        app_result = client.table("applications")\
            .select("id")\
            .eq("id", application_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not app_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get vulnerabilities with filtering
        severity_values = [s.value for s in severity] if severity else None
        result = await vuln_service.get_application_vulnerabilities(
            application_id,
            severity_filter=severity_values
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/component/{component_id}", response_model=List[VulnerabilityResponse])
async def get_component_vulnerabilities(
    component_id: str,
    user_id: str = Depends(get_current_user_id),
    vuln_service: VulnerabilityService = Depends(get_vulnerability_service)
):
    """
    Get all vulnerabilities affecting a specific component.
    
    Returns detailed vulnerability information for a single component,
    useful for drilling down into specific dependencies.
    
    **Returns:**
    List of vulnerabilities with:
    - CVE information
    - CVSS v3 and v2 scores
    - Severity ratings
    - Affected version ranges
    - CWE classifications
    - Reference links
    
    **Example Response:**
    ```json
    [
        {
            "id": "vuln-uuid",
            "cve_id": "CVE-2024-12345",
            "description": "Remote code execution...",
            "cvss_v3": {
                "score": 9.8,
                "severity": "CRITICAL",
                "vector_string": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
            },
            "cwe_ids": ["CWE-79", "CWE-89"],
            "references": [
                "https://nvd.nist.gov/vuln/detail/CVE-2024-12345"
            ]
        }
    ]
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # Verify user has access to this component
        result = client.table("application_components")\
            .select("applications(user_id)")\
            .eq("component_id", component_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Component not found")
        
        # Check ownership
        if result.data[0]["applications"]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get vulnerabilities
        vulnerabilities = await vuln_service.get_component_vulnerabilities(component_id)
        
        return [VulnerabilityResponse(**v["vulnerabilities"]) for v in vulnerabilities]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scan-history/{application_id}")
async def get_scan_history(
    application_id: str,
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get vulnerability scan history for an application.
    
    Returns historical scan data showing trends over time.
    
    **Query Parameters:**
    - `limit`: Maximum number of scans to return (default: 10, max: 100)
    
    **Returns:**
    List of scan records with:
    - Scan ID and timestamp
    - Scan type and status
    - Vulnerabilities found
    - New and resolved vulnerabilities
    - Scan duration
    
    **Example Response:**
    ```json
    [
        {
            "id": "scan-uuid",
            "application_id": "app-uuid",
            "scan_type": "FULL",
            "vulnerabilities_found": 27,
            "new_vulnerabilities": 3,
            "resolved_vulnerabilities": 1,
            "scan_duration_seconds": 45,
            "scan_status": "COMPLETED",
            "created_at": "2024-12-08T10:30:00Z"
        }
    ]
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # Verify ownership
        app_result = client.table("applications")\
            .select("id")\
            .eq("id", application_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not app_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get scan history
        result = client.table("vulnerability_scan_history")\
            .select("*")\
            .eq("application_id", application_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data if result.data else []
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notifications", response_model=List[VulnerabilityNotification])
async def get_vulnerability_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get vulnerability notifications for the current user.
    
    Returns notifications about new vulnerabilities discovered in user's applications.
    
    **Query Parameters:**
    - `unread_only`: Only return unread notifications (default: false)
    - `limit`: Maximum notifications to return (default: 50, max: 200)
    
    **Returns:**
    List of notifications with:
    - Notification details
    - Associated vulnerability information
    - Application details
    - Read status
    
    **Example Response:**
    ```json
    [
        {
            "id": "notif-uuid",
            "user_id": "user-uuid",
            "application_id": "app-uuid",
            "application_name": "My App",
            "vulnerability": {
                "cve_id": "CVE-2024-12345",
                "cvss_v3_score": 9.8,
                "cvss_v3_severity": "CRITICAL"
            },
            "notification_type": "NEW_VULNERABILITY",
            "is_read": false,
            "sent_at": "2024-12-08T10:30:00Z"
        }
    ]
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        query = client.table("vulnerability_notifications")\
            .select("*, vulnerabilities(*), applications(name)")\
            .eq("user_id", user_id)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        result = query.order("sent_at", desc=True)\
            .limit(limit)\
            .execute()
        
        if not result.data:
            return []
        
        # Transform data for response
        notifications = []
        for notif in result.data:
            notifications.append({
                **notif,
                "application_name": notif["applications"]["name"],
                "vulnerability": notif["vulnerabilities"]
            })
        
        return notifications
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/applications/{application_id}/scan")
async def start_vulnerability_scan(
    application_id: str,
    force_refresh: bool = False,
    user_id: str = Depends(get_current_user_id)
):
    """Start async vulnerability scan."""
    try:
        # Verify application exists and belongs to user
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        app_result = client.table("applications")\
            .select("id, user_id")\
            .eq("id", application_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not app_result.data or len(app_result.data) == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Start scan
        from app.services.vulnerability_service import VulnerabilityService
        service = VulnerabilityService()
        result = await service.start_vulnerability_scan(application_id, force_refresh)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting scan: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scan-jobs/{job_id}/status")
async def get_scan_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get scan job status."""
    try:
        from app.services.vulnerability_service import VulnerabilityService
        service = VulnerabilityService()
        status = await service.get_scan_status(job_id)
        
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Mark a notification as read.
    
    Updates the notification status and records the read timestamp.
    
    **Returns:**
    - Success message
    
    **Example Response:**
    ```json
    {
        "message": "Notification marked as read",
        "notification_id": "notif-uuid"
    }
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # Update notification
        result = client.table("vulnerability_notifications")\
            .update({
                "is_read": True,
                "read_at": datetime.now().isoformat()
            })\
            .eq("id", notification_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {
            "message": "Notification marked as read",
            "notification_id": notification_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=VulnerabilityStats)
async def get_vulnerability_stats(
    user_id: str = Depends(get_current_user_id)
):
    """
    Get overall vulnerability statistics for all user applications.
    
    Provides portfolio-wide vulnerability metrics and trends.
    
    **Returns:**
    - Total applications and vulnerable applications count
    - Total vulnerabilities and unique CVEs
    - Severity distribution across all applications
    - Most common vulnerabilities
    - Most vulnerable components
    
    **Example Response:**
    ```json
    {
        "total_applications": 15,
        "applications_with_vulnerabilities": 12,
        "total_vulnerabilities": 247,
        "unique_cves": 89,
        "severity_distribution": {
            "CRITICAL": 8,
            "HIGH": 34,
            "MEDIUM": 123,
            "LOW": 82
        },
        "most_common_vulnerabilities": [
            {
                "cve_id": "CVE-2024-12345",
                "affected_applications": 8,
                "severity": "CRITICAL"
            }
        ]
    }
    ```
    """
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # Get all user applications
        apps_result = client.table("applications")\
            .select("id")\
            .eq("user_id", user_id)\
            .execute()
        
        total_applications = len(apps_result.data) if apps_result.data else 0
        
        if total_applications == 0:
            return VulnerabilityStats(
                total_applications=0,
                applications_with_vulnerabilities=0,
                total_vulnerabilities=0,
                unique_cves=0
            )
        
        app_ids = [app["id"] for app in apps_result.data]
        
        # Get vulnerability summaries
        summaries_result = client.table("application_vulnerability_summary")\
            .select("*")\
            .in_("application_id", app_ids)\
            .execute()
        
        # Calculate stats
        applications_with_vulnerabilities = 0
        total_vulnerabilities = 0
        severity_distribution = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
            "INFO": 0
        }
        
        for summary in summaries_result.data:
            if summary["total_count"] > 0:
                applications_with_vulnerabilities += 1
            total_vulnerabilities += summary["total_count"]
            severity_distribution["CRITICAL"] += summary["critical_count"]
            severity_distribution["HIGH"] += summary["high_count"]
            severity_distribution["MEDIUM"] += summary["medium_count"]
            severity_distribution["LOW"] += summary["low_count"]
            severity_distribution["INFO"] += summary.get("info_count", 0)
        
        # Get unique CVE count
        # This requires joining through components to vulnerabilities
        # Simplified version - could be optimized with a database function
        unique_cves = 0  # Placeholder
        
        return VulnerabilityStats(
            total_applications=total_applications,
            applications_with_vulnerabilities=applications_with_vulnerabilities,
            total_vulnerabilities=total_vulnerabilities,
            unique_cves=unique_cves,
            severity_distribution=severity_distribution,
            most_common_vulnerabilities=[],
            most_vulnerable_components=[]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))