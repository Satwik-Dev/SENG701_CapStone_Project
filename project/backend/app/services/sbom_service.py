from supabase import Client
from typing import Dict, Any, List, Optional, Tuple
import uuid
from datetime import datetime


class SBOMService:
    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
    
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
        Store application record or return existing one if file hash matches.
        
        Returns:
            tuple: (application_id, is_new_record)
                - application_id: The ID of the application (new or existing)
                - is_new_record: True if a new record was created, False if existing was found
        """
        
        try:
            # First, check if this file hash already exists
            print(f"🔍 Checking for existing application with hash: {file_hash[:16]}...")
            
            # Query using service_role (bypasses RLS) to check ALL users
            from app.core.database import get_supabase_client
            service_client = get_supabase_client()  # Already uses SERVICE_KEY from database.py

            existing_response = service_client.table("applications")\
                .select("*")\
                .eq("file_hash", file_hash)\
                .limit(1)\
                .execute()
            
            if existing_response.data and len(existing_response.data) > 0:
                existing_app = existing_response.data[0]
                print(f"✅ Found existing application: {existing_app['id']}")
                print(f"   Status: {existing_app['status']}")
                print(f"   Original user: {existing_app['user_id']}")
                print(f"   Current user: {user_id}")

                # CHECK: If same user already has this file, throw error (Case 3)
                if existing_app['user_id'] == user_id:
                    print(f"❌ Same user attempting re-upload")
                    raise Exception(f"You have already uploaded this file: {existing_app['original_filename']}")
                
                # If the file is already completed, we can return it immediately
                if existing_app['status'] == 'completed':
                    print(f"✅ Existing application is completed. Reusing SBOM data.")
                    
                    # Create a new application record for this user that references the same SBOM
                    new_app_id = str(uuid.uuid4())
                    
                    # Copy the SBOM data from the existing application
                    existing_full = self.client.table("applications")\
                        .select("*")\
                        .eq("id", existing_app['id'])\
                        .execute()
                    
                    if existing_full.data:
                        existing_data = existing_full.data[0]
                        
                        new_app_data = {
                            "id": new_app_id,
                            "user_id": user_id,
                            "name": filename.rsplit('.', 1)[0],
                            "original_filename": filename,
                            "file_size": file_size,
                            "file_hash": file_hash,
                            "storage_path": storage_path,
                            "platform": existing_data.get('platform', platform),
                            "status": "completed",  # Already processed
                            "component_count": existing_data.get('component_count', 0),
                            "sbom_data": existing_data.get('sbom_data'),
                            "spdx_data": existing_data.get('spdx_data'),
                            "sbom_format": existing_data.get('sbom_format', 'cyclonedx'),
                            "analyzed_at": existing_data.get('analyzed_at'),
                            "created_at": datetime.utcnow().isoformat(),
                            "error_message": None
                        }
                        
                        # Insert the new application record with copied SBOM data
                        self.client.table("applications").insert(new_app_data).execute()
                        
                        # Copy component relationships if they exist
                        await self._copy_component_relationships(existing_app['id'], new_app_id)
                        
                        print(f"✅ Created new application record for user {user_id} with existing SBOM data")
                        return new_app_id, False  # Not a new SBOM generation
                
                # If still processing, return the existing app ID
                elif existing_app['status'] == 'processing':
                    print(f"⏳ Existing application is still processing. Creating reference record.")
                    
                    new_app_id = str(uuid.uuid4())
                    new_app_data = {
                        "id": new_app_id,
                        "user_id": user_id,
                        "name": filename.rsplit('.', 1)[0],
                        "original_filename": filename,
                        "file_size": file_size,
                        "file_hash": file_hash,
                        "storage_path": storage_path,
                        "platform": platform,
                        "status": "processing",
                        "component_count": 0,
                        "created_at": datetime.utcnow().isoformat(),
                        "error_message": f"Waiting for existing processing job: {existing_app['id']}"
                    }
                    
                    self.client.table("applications").insert(new_app_data).execute()
                    print(f"✅ Created reference record while original processes")
                    return new_app_id, False
            
            # No existing application found, create a new one
            print(f"🆕 No existing application found. Creating new record.")
            
            app_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": filename.rsplit('.', 1)[0],
                "original_filename": filename,
                "file_size": file_size,
                "file_hash": file_hash,
                "storage_path": storage_path,
                "platform": platform,
                "status": "processing",
                "component_count": 0,
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = self.client.table("applications").insert(app_data).execute()
            print(f"✅ New application created: {app_data['id']}")
            
            return app_data["id"], True  # New record created
            
        except Exception as e:
            print(f"❌ Error in store_application: {str(e)}")
            raise Exception(f"Failed to store application: {str(e)}")
    
    async def _copy_component_relationships(
        self,
        source_app_id: str,
        target_app_id: str
    ) -> None:
        """
        Copy component relationships from one application to another.
        This avoids re-analyzing the same file multiple times.
        """
        try:
            # Get all component relationships from source
            relationships = self.client.table("application_components")\
                .select("component_id")\
                .eq("application_id", source_app_id)\
                .execute()
            
            if relationships.data:
                # Create new relationships for target application
                new_relationships = [
                    {
                        "application_id": target_app_id,
                        "component_id": rel["component_id"]
                    }
                    for rel in relationships.data
                ]
                
                if new_relationships:
                    self.client.table("application_components")\
                        .insert(new_relationships)\
                        .execute()
                    
                    print(f"✅ Copied {len(new_relationships)} component relationships")
        except Exception as e:
            print(f"⚠️  Warning: Could not copy component relationships: {str(e)}")
            # Don't fail the entire operation if this fails
    
    async def update_application_sbom(
        self,
        app_id: str,
        cyclonedx_data: Dict[str, Any],
        spdx_data: Dict[str, Any],
        components: List[Dict],
        platform: str = "unknown"
    ) -> None:
        """
        Store BOTH CycloneDX and SPDX formats.
        """
        
        try:
            component_count = await self._store_components(app_id, components)
            
            update_data = {
                "sbom_data": cyclonedx_data,  # Primary format
                "spdx_data": spdx_data,        # Secondary format
                "sbom_format": "cyclonedx",
                "component_count": component_count,
                "platform": platform,
                "status": "completed",
                "analyzed_at": datetime.utcnow().isoformat(),
                "error_message": None  # Clear any previous errors
            }
            
            self.client.table("applications").update(update_data).eq("id", app_id).execute()
            
            print(f"✅ Stored {component_count} components for application {app_id}")
            
        except Exception as e:
            self.client.table("applications").update({
                "status": "failed",
                "error_message": str(e)
            }).eq("id", app_id).execute()
            
            raise Exception(f"Failed to update SBOM: {str(e)}")
    
    async def _store_components(
        self,
        app_id: str,
        components: List[Dict]
    ) -> int:
        """
        Store components with proper duplicate handling.
        """
        
        if not components:
            return 0
        
        stored_count = 0
        
        for component in components:
            try:
                # Check if component already exists
                component_id = f"{component['name']}@{component['version']}"
                
                existing = self.client.table("components")\
                    .select("id")\
                    .eq("id", component_id)\
                    .execute()
                
                # Insert component if it doesn't exist
                if not existing.data:
                    component_data = {
                        "id": component_id,
                        "name": component["name"],
                        "version": component["version"],
                        "type": component.get("type", "library"),
                        "license": component.get("license"),
                        "purl": component.get("purl")
                    }
                    
                    self.client.table("components").insert(component_data).execute()
                
                # Create relationship between application and component
                # Use upsert to handle duplicates gracefully
                relationship = {
                    "application_id": app_id,
                    "component_id": component_id
                }
                
                self.client.table("application_components")\
                    .upsert(relationship, on_conflict="application_id,component_id")\
                    .execute()
                
                stored_count += 1
                
            except Exception as e:
                print(f"⚠️  Warning: Failed to store component {component.get('name')}: {str(e)}")
                continue
        
        return stored_count