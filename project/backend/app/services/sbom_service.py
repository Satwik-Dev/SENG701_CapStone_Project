from supabase import Client
from typing import Dict, Any, List, Optional, Tuple
import uuid
from datetime import datetime


class SBOMService:
    
    def __init__(self, supabase_client: Client = None):
        """
        Initialize SBOM service.
        """
        self.client = None
    
    def _get_service_client(self) -> Client:
        """
        Get a fresh service client with SERVICE_ROLE_KEY.
        """
        from app.core.database import get_supabase_client
        return get_supabase_client()
    
    async def store_application(
        self,
        user_id: str,
        filename: str,
        file_size: int,
        file_hash: str,
        storage_path: str,
        platform: str = "unknown"
    ) -> Tuple[str, bool]:
        """
        Store application record with complete user isolation.
        """
        
        try:
            # Check if THIS USER has already uploaded this exact file
            print(f"Checking if user {user_id[:8]}... already uploaded: {file_hash[:16]}...")
            
            # Use service client to bypass RLS for read operations
            from app.core.database import get_supabase_client
            service_client = self._get_service_client()
            
            # Query for this specific user + file_hash combination ONLY
            existing_response = service_client.table("applications")\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("file_hash", file_hash)\
                .limit(1)\
                .execute()
            
            # If THIS user already uploaded this file, reject it
            if existing_response.data and len(existing_response.data) > 0:
                existing_app = existing_response.data[0]
                print(f"User already uploaded this file: {existing_app['original_filename']}")
                print(f"Existing application ID: {existing_app['id']}")
                print(f"Status: {existing_app['status']}")
                raise Exception(
                    f"You have already uploaded this file: {existing_app['original_filename']}. "
                    f"Application ID: {existing_app['id']}"
                )
            
            # No duplicate found for this user - create new application record
            print(f"New file for user. Creating application record.")
            
            app_id = str(uuid.uuid4())
            app_data = {
                "id": app_id,
                "user_id": user_id,
                "name": filename.rsplit('.', 1)[0] if '.' in filename else filename,
                "original_filename": filename,
                "file_size": file_size,
                "file_hash": file_hash,
                "storage_path": storage_path,
                "platform": platform,
                "status": "processing",
                "component_count": 0,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insert using service_client to bypass RLS
            response = service_client.table("applications").insert(app_data).execute()
            print(f"New application created: {app_id}")
            
            return app_id, True
            
        except Exception as e:
            error_msg = str(e)
            # Re-raise our custom duplicate message as-is
            if "already uploaded this file" in error_msg:
                raise
            # For other errors, wrap them
            print(f"Error in store_application: {error_msg}")
            raise Exception(f"Failed to store application: {error_msg}")
    
    async def update_application_sbom(
        self,
        user_id: str,
        app_id: str,
        cyclonedx_data: Dict[str, Any],
        spdx_data: Dict[str, Any],
        components: List[Dict],
        platform: str = "unknown"
    ) -> None:
        """
        Store BOTH CycloneDX and SPDX formats in the application record.
        """
        
        try:
            # Store components and get the count
            component_count = await self._store_components(user_id, app_id, components)
            
            # Prepare update data with both SBOM formats
            update_data = {
                "sbom_data": cyclonedx_data,  # Primary format (CycloneDX)
                "spdx_data": spdx_data,        # Secondary format (SPDX)
                "sbom_format": "cyclonedx",    # Indicate primary format
                "component_count": component_count,
                "platform": platform,
                "status": "completed",
                "analyzed_at": datetime.utcnow().isoformat(),
                "error_message": None  # Clear any previous errors
            }
            
            # Use service client to bypass RLS
            from app.core.database import get_supabase_client
            service_client = self._get_service_client()
            
            service_client.table("applications")\
                .update(update_data)\
                .eq("id", app_id)\
                .execute()
            
            print(f"Stored {component_count} components for application {app_id}")
            
        except Exception as e:
            # Update status to failed
            from app.core.database import get_supabase_client
            service_client = self._get_service_client()
            
            service_client.table("applications").update({
                "status": "failed",
                "error_message": str(e)
            }).eq("id", app_id).execute()
            
            raise Exception(f"Failed to update SBOM: {str(e)}")
    
    async def _store_components(
        self,
        user_id: str,
        app_id: str,
        components: List[Dict]
    ) -> int:
        """
        Store components with proper error handling and validation.
        """
        
        if not components:
            print("No components provided to store")
            return 0
        
        print(f"Starting to store {len(components)} components for app {app_id}")
        stored_count = 0
        failed_count = 0
        
        # Use service client for all database operations
        from app.core.database import get_supabase_client
        service_client = self._get_service_client()
        
        for idx, component in enumerate(components, 1):
            try:
                # Extract and validate component data
                name = str(component.get('name', '')).strip()
                version = str(component.get('version', 'unknown')).strip()
                
                # Skip invalid components
                if not name or name.lower() in ['', 'none', 'unknown', 'null']:
                    print(f"  [{idx}/{len(components)}] Skipped invalid component")
                    failed_count += 1
                    continue
                
                # Generate component ID (unique per user)
                component_id = f"{user_id}:{name}@{version}"
                
                # Check if component exists for this user
                existing_comp = service_client.table("components")\
                    .select("id")\
                    .eq("id", component_id)\
                    .eq("user_id", user_id)\
                    .execute()
                
                # Insert component if it doesn't exist for this user
                component_insert_failed = False
                if not existing_comp.data:
                    component_data = {
                        "id": component_id,
                        "name": name,
                        "version": version,
                        "type": component.get("type", "library"),
                        "license": component.get("license"),
                        "purl": component.get("purl"),
                        "cpe": component.get("cpe"),
                        "description": component.get("description"),
                        "supplier": component.get("supplier"),
                        "author": component.get("author"),
                        "homepage": component.get("homepage"),
                        "repository_url": component.get("repository_url"),
                        "user_id": user_id,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
                    try:
                        service_client.table("components").insert(component_data).execute()
                        print(f"  [{idx}/{len(components)}] Component inserted: {name}@{version}")
                    except Exception as comp_err:
                        error_msg = str(comp_err).lower()
                        # Duplicate is OK - component was inserted by another process
                        if 'duplicate' in error_msg or 'unique' in error_msg:
                            print(f"  [{idx}/{len(components)}] Component already exists (duplicate): {name}@{version}")
                        else:
                            # Real error - log it and skip this component
                            print(f"  [{idx}/{len(components)}] Component insert FAILED: {name}@{version}")
                            print(f"       Error: {str(comp_err)}")
                            component_insert_failed = True
                            failed_count += 1
                            continue
                
                # IMPORTANT: Only create relationship if component exists
                # Verify component exists before creating relationship
                verify_comp = service_client.table("components")\
                    .select("id")\
                    .eq("id", component_id)\
                    .eq("user_id", user_id)\
                    .execute()
                
                if not verify_comp.data:
                    print(f"  [{idx}/{len(components)}] Component doesn't exist, skipping relationship: {name}@{version}")
                    failed_count += 1
                    continue
                
                # Check if relationship already exists
                existing_rel = service_client.table("application_components")\
                    .select("id")\
                    .eq("application_id", app_id)\
                    .eq("component_id", component_id)\
                    .eq("user_id", user_id)\
                    .execute()
                
                # Only insert if relationship doesn't exist
                if not existing_rel.data:
                    relationship_id = str(uuid.uuid4())
                    relationship = {
                        "id": relationship_id,
                        "application_id": app_id,
                        "component_id": component_id,
                        "user_id": user_id,
                        "relationship_type": component.get("relationship_type", "direct"),
                        "depth": component.get("depth", 0),
                        "confidence": component.get("confidence", 1.0),
                        "detected_by": component.get("detected_by", "syft"),
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
                    result = service_client.table("application_components")\
                        .insert(relationship)\
                        .execute()
                    
                    if result.data:
                        stored_count += 1
                        # Show progress every 50 components
                        if idx % 50 == 0:
                            print(f"  Progress: {idx}/{len(components)} processed, {stored_count} stored")
                else:
                    # Relationship already exists, count as stored
                    stored_count += 1
                    
            except Exception as e:
                failed_count += 1
                error_msg = str(e)
                component_name = component.get('name', 'unknown')
                print(f"  [{idx}/{len(components)}] Error: {component_name}: {error_msg}")
                continue
        
        # Final summary
        print(f"\nStorage Summary for app {app_id}:")
        print(f"  Successfully stored: {stored_count}/{len(components)}")
        print(f"  Failed/Skipped: {failed_count}/{len(components)}")
        
        if stored_count == 0 and len(components) > 0:
            print(f"  WARNING: No components were stored! Check errors above.")
        
        return stored_count
    
    async def get_application(self, user_id: str, app_id: str) -> Optional[Dict[str, Any]]:
        """
        Get application details for a specific user.
        """
        
        try:
            from app.core.database import get_supabase_client
            service_client = self._get_service_client()
            
            # Query with user_id filter to enforce isolation
            response = service_client.table("applications")\
                .select("*")\
                .eq("id", app_id)\
                .eq("user_id", user_id)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            
            return None
            
        except Exception as e:
            print(f"Error getting application: {str(e)}")
            return None
    
    async def delete_application(self, user_id: str, app_id: str) -> bool:
        """
        Delete application and all associated data.
        """
        
        try:
            from app.core.database import get_supabase_client
            service_client = self._get_service_client()
            
            # First verify the application belongs to this user
            app = await self.get_application(user_id, app_id)
            if not app:
                print(f"Application {app_id} not found or not authorized for user {user_id}")
                return False
            
            # Delete application_components relationships
            service_client.table("application_components")\
                .delete()\
                .eq("application_id", app_id)\
                .eq("user_id", user_id)\
                .execute()
            
            # Delete the application record
            service_client.table("applications")\
                .delete()\
                .eq("id", app_id)\
                .eq("user_id", user_id)\
                .execute()
            
            print(f"Deleted application {app_id} for user {user_id}")
            return True
            
        except Exception as e:
            print(f"Error deleting application: {str(e)}")
            return False
    
    async def list_user_applications(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        platform: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List applications for a specific user with pagination and filters.
        """
        
        try:
            from app.core.database import get_supabase_client
            service_client = self._get_service_client()
            
            # Calculate offset
            offset = (page - 1) * limit
            
            # Build query with user filter
            query = service_client.table("applications")\
                .select("*", count="exact")\
                .eq("user_id", user_id)
            
            # Apply filters if provided
            if platform:
                query = query.eq("platform", platform)
            if status:
                query = query.eq("status", status)
            
            # Apply pagination and ordering
            query = query.order("created_at", desc=True)\
                .range(offset, offset + limit - 1)
            
            response = query.execute()
            
            return {
                "applications": response.data,
                "total": response.count,
                "page": page,
                "limit": limit,
                "total_pages": (response.count + limit - 1) // limit if response.count else 0
            }
            
        except Exception as e:
            print(f"Error listing applications: {str(e)}")
            return {
                "applications": [],
                "total": 0,
                "page": page,
                "limit": limit,
                "total_pages": 0
            }