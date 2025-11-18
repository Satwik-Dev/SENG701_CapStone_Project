from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user_id
from app.core.database import get_supabase_client
from app.services.comparison_service import ComparisonService
from app.models.comparison import ComparisonRequest, ComparisonResult
from supabase import Client

router = APIRouter(prefix="/compare", tags=["Comparison"])

@router.post("/", response_model=ComparisonResult)
async def compare_applications(
    request: ComparisonRequest,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Compare two SBOM applications and return detailed differences.
    """
    if request.app1_id == request.app2_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot compare an application with itself"
        )
    
    try:
        comparison_service = ComparisonService(supabase_client)
        result = await comparison_service.compare_applications(
            request.app1_id,
            request.app2_id,
            user_id
        )
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(e)}"
        )