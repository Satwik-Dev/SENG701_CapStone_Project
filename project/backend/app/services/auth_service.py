from typing import Optional, Dict, Any
from supabase import Client
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from datetime import timedelta
from app.core.config import settings
from app.services.password_reset_service import PasswordResetService


class AuthService:
    """Service for handling authentication operations."""
    
    def __init__(self, supabase_client: Client):
        """
        Initialize auth service.
        """
        self.client = supabase_client
        self.password_reset_service = PasswordResetService(supabase_client)
    
    async def register(self, user_data: UserCreate) -> Dict[str, Any]:
        """
        Register a new user.
        """
        try:
            # Register user with Supabase Auth
            response = self.client.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name or ""
                    }
                }
            })
            
            if response.user is None:
                raise Exception("Registration failed")
            
            return {
                "message": "Registration successful. Please check your email to verify your account.",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": user_data.full_name,
                    "is_verified": False
                }
            }
            
        except Exception as e:
            error_msg = str(e)
            if "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
                raise Exception("User with this email already exists")
            raise Exception(f"Registration failed: {error_msg}")
    
    async def login(self, credentials: UserLogin) -> Token:
        """
        Login user and return tokens.
        """
        try:
            # Sign in with Supabase Auth
            response = self.client.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })
            
            if response.user is None or response.session is None:
                raise Exception("Invalid credentials")
            
            user = response.user
            
            # Create custom JWT tokens
            access_token = create_access_token(
                data={"sub": user.id, "email": user.email}
            )
            
            refresh_token = create_refresh_token(
                data={"sub": user.id, "email": user.email}
            )
            
            # Get user metadata
            user_metadata = user.user_metadata or {}
            
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                user=UserResponse(
                    id=user.id,
                    email=user.email,
                    full_name=user_metadata.get("full_name", ""),
                    is_verified=user.email_confirmed_at is not None,
                    created_at=user.created_at
                )
            )
            
        except Exception as e:
            error_msg = str(e)
            if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
                raise Exception("Invalid email or password")
            raise Exception(f"Login failed: {error_msg}")
    
    async def refresh_token(self, refresh_token: str) -> Token:
        """
        Refresh access token using refresh token.
        """
        try:
            # Verify refresh token
            payload = verify_token(refresh_token, token_type="refresh")
            
            if payload is None:
                raise Exception("Invalid or expired refresh token")
            
            user_id = payload.get("sub")
            email = payload.get("email")
            
            if not user_id or not email:
                raise Exception("Invalid token payload")
            
            # Get user info from Supabase using Admin API
            user_response = self.client.auth.admin.get_user_by_id(user_id)
            
            if user_response.user is None:
                raise Exception("User not found")
            
            user = user_response.user
            
            # Create new tokens
            new_access_token = create_access_token(
                data={"sub": user.id, "email": user.email}
            )
            
            new_refresh_token = create_refresh_token(
                data={"sub": user.id, "email": user.email}
            )
            
            user_metadata = user.user_metadata or {}
            
            return Token(
                access_token=new_access_token,
                refresh_token=new_refresh_token,
                token_type="bearer",
                user=UserResponse(
                    id=user.id,
                    email=user.email,
                    full_name=user_metadata.get("full_name", ""),
                    is_verified=user.email_confirmed_at is not None,
                    created_at=user.created_at
                )
            )
            
        except Exception as e:
            raise Exception(f"Token refresh failed: {str(e)}")
    
    async def get_current_user(self, user_id: str) -> UserResponse:
        """
        Get current user from user ID.
        """
        try:
            # Use Admin API to get user by ID
            response = self.client.auth.admin.get_user_by_id(user_id)
            
            if response.user is None:
                raise Exception("User not found")
            
            user = response.user
            user_metadata = user.user_metadata or {}
            
            return UserResponse(
                id=user.id,
                email=user.email or "",
                full_name=user_metadata.get("full_name", ""),
                is_verified=user.email_confirmed_at is not None,
                created_at=user.created_at
            )
            
        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")
    
    async def request_password_reset(self, email: str) -> Dict[str, str]:
        """Request password reset via Supabase"""
        return await self.password_reset_service.request_password_reset(email)

    async def reset_password(self, access_token: str, new_password: str) -> Dict[str, str]:
        """Reset password using Supabase token."""
        return await self.password_reset_service.verify_and_reset_password(
            access_token, new_password
        )