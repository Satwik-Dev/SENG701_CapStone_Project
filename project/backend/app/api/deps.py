"""
FastAPI dependencies for authentication and authorization.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.database import get_supabase_client
from app.core.security import verify_token
from app.services.auth_service import AuthService
from supabase import Client


# Security scheme for Bearer token
security = HTTPBearer()


def get_auth_service(
    supabase_client: Client = Depends(get_supabase_client)
) -> AuthService:
    """
    Dependency to get auth service instance.
    
    Args:
        supabase_client: Supabase client from dependency
        
    Returns:
        AuthService instance
    """
    return AuthService(supabase_client)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Dependency to get current user ID from JWT token.
    
    Args:
        credentials: HTTP Bearer token
        
    Returns:
        User ID from token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    # Verify token
    payload = verify_token(token, token_type="access")
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: Optional[str] = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


async def get_optional_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    Optional dependency to get current user ID.
    Returns None if no token provided.
    
    Args:
        credentials: Optional HTTP Bearer token
        
    Returns:
        User ID or None
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user_id(credentials)
    except HTTPException:
        return None