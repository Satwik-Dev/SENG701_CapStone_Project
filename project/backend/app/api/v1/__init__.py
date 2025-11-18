from fastapi import APIRouter
from app.api.v1 import auth, upload, applications, contact, comparison

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(upload.router)
api_router.include_router(applications.router)
api_router.include_router(contact.router)
api_router.include_router(comparison.router)