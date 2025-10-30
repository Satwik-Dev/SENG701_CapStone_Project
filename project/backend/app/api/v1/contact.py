from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user_id
from app.services.contact_service import ContactService
from app.core.database import get_supabase_client
from app.core.security import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import Client

router = APIRouter(prefix="/contact", tags=["contact"])
security = HTTPBearer()


class ContactRequest(BaseModel):
    category: str
    subject: str
    message: str


class ContactResponse(BaseModel):
    message: str
    contact_id: str


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def send_contact_message(
    contact_data: ContactRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Send contact form message via email.
    """
    try:
        # Get token and decode to get user info
        token = credentials.credentials
        payload = verify_token(token, token_type="access")
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user_id = payload.get("sub")
        user_email = payload.get("email")
        
        if not user_id or not user_email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Create contact service
        contact_service = ContactService(supabase_client)
        
        # Send message
        result = await contact_service.send_contact_message(
            category=contact_data.category,
            subject=contact_data.subject,
            message=contact_data.message,
            user_id=user_id,
            user_email=user_email
        )
        
        return ContactResponse(
            message=result["message"],
            contact_id=result["contact_id"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )