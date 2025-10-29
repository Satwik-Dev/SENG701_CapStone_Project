from supabase import create_client, Client
from app.core.config import settings
from typing import Optional


class DatabaseClient:
    """Singleton class for Supabase database client."""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """
        Get or create Supabase client instance.
        """
        if cls._instance is None:
            cls._instance = create_client(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_SERVICE_KEY  # Use service key for backend
            )
            print("Supabase client initialized")
        
        return cls._instance
    
    @classmethod
    def reset_client(cls):
        """Reset client instance (useful for testing)."""
        cls._instance = None


# Create a function to get the client easily
def get_supabase_client() -> Client:
    """
    Dependency function to get Supabase client.
    """
    return DatabaseClient.get_client()


# For convenience, create a global instance
supabase_client = get_supabase_client()