"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token, 
    TokenRefresh,
    PasswordReset
)
from app.services.auth_service import AuthService
from app.api.deps import get_auth_service, get_current_user_id


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **password**: Strong password (min 8 chars, uppercase, lowercase, number)
    - **full_name**: Optional full name
    
    Returns success message and user info.
    Email verification link will be sent to the provided email.
    """
    try:
        result = await auth_service.register(user_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login with email and password.
    
    - **email**: User email
    - **password**: User password
    
    Returns access token, refresh token, and user info.
    """
    try:
        token = await auth_service.login(credentials)
        return token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Refresh access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token and refresh token.
    """
    try:
        new_token = await auth_service.refresh_token(token_data.refresh_token)
        return new_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get current user information.
    
    Requires valid access token in Authorization header.
    
    Returns current user details.
    """
    try:
        user = await auth_service.get_current_user(user_id)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    data: PasswordReset,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Request password reset email.
    
    - **email**: User email
    
    Sends password reset link to email if account exists.
    """
    result = await auth_service.request_password_reset(data.email)
    return result