"""
API v1 router.
Combines all v1 API endpoints.
"""

from fastapi import APIRouter
from app.api.v1 import auth


# Create main v1 router
api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router)

# Future routers will be added here:
# api_router.include_router(applications.router)
# api_router.include_router(search.router)
# api_router.include_router(compare.router)