from supabase import Client
from typing import Dict
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class PasswordResetService:
    def __init__(self, client: Client):
        self.client = client
    
    async def request_password_reset(self, email: str) -> Dict[str, str]:
        """
        Request password reset using Supabase's built-in functionality.
        Supabase will send the email and handle the token.
        """
        try:
            logger.info(f"Password reset requested for email: {email}")
            
            response = self.client.auth.reset_password_email(
                email,
                {
                    "redirect_to": f"{settings.FRONTEND_URL}/auth/callback"
                }
            )
            
            logger.info(f"Password reset email sent via Supabase for {email}")
            
            return {
                "message": "If an account exists with this email, a password reset link has been sent."
            }
            
        except Exception as e:
            logger.error(f"Password reset request failed: {e}")
            return {
                "message": "If an account exists with this email, a password reset link has been sent."
            }
    
    async def verify_and_reset_password(
        self, 
        access_token: str,
        new_password: str
    ) -> Dict[str, str]:
        """
        Update password using Supabase session.
        The access_token comes from Supabase's callback after clicking the reset link.
        """
        try:
            # Set the session with the access token from Supabase
            session_response = self.client.auth.set_session(access_token, access_token)
            
            if not session_response.user:
                raise Exception("Invalid or expired reset link")
            
            # Update the password
            update_response = self.client.auth.update_user({
                "password": new_password
            })
            
            if not update_response.user:
                raise Exception("Failed to update password")
            
            logger.info(f"Password reset successful for user {update_response.user.id}")
            
            return {
                "message": "Password has been reset successfully. You can now log in with your new password."
            }
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Password reset failed: {error_msg}")
            raise Exception(f"Failed to reset password: {error_msg}")