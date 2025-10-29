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
            # First, check if this file hash already exists (check ALL users)
            print(f"🔍 Checking for existing application with hash: {file_hash[:16]}...")
            
            # Use service client to bypass RLS and check ALL users
            from app.core.database import get_supabase_client
            service_client = get_supabase_client()  # Already uses SERVICE_KEY
            
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
                
                # Case 3: Same user trying to re-upload - REJECT
                if existing_app['user_id'] == user_id:
                    print(f"❌ Same user attempting re-upload")
                    raise Exception(f"You have already uploaded this file: {existing_app['original_filename']}")
                
                # If the file is already completed, we can return it immediately
                if existing_app['status'] == 'completed':
                    print(f"✅ Existing application is completed. Reusing SBOM data.")
                    
                    # Create a new application record for this user that references the same SBOM
                    new_app_id = str(uuid.uuid4())
                    
                    new_app_data = {
                        "id": new_app_id,
                        "user_id": user_id,
                        "name": filename.rsplit('.', 1)[0],
                        "original_filename": filename,
                        "file_size": file_size,
                        "file_hash": file_hash,
                        "storage_path": storage_path,
                        "platform": existing_app.get('platform', platform),
                        "status": "completed",  # Already processed
                        "component_count": existing_app.get('component_count', 0),
                        "sbom_data": existing_app.get('sbom_data'),
                        "spdx_data": existing_app.get('spdx_data'),
                        "sbom_format": existing_app.get('sbom_format', 'cyclonedx'),
                        "analyzed_at": existing_app.get('analyzed_at'),
                        "created_at": datetime.utcnow().isoformat(),
                        "error_message": None
                    }
                    
                    # Insert the new application record with copied SBOM data
                    self.client.table("applications").insert(new_app_data).execute()
                    
                    # Copy component relationships if they exist
                    await self._copy_component_relationships(user_id, existing_app['id'], new_app_id)
                    
                    print(f"✅ Created new application record for user {user_id} with existing SBOM data")
                    return new_app_id, False  # Not a new SBOM generation
                
                # If still processing, create reference record
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
            
            # Use service client to insert (bypasses RLS for creation)
            from app.core.database import get_supabase_client
            service_client = get_supabase_client()
            response = service_client.table("applications").insert(app_data).execute()
            print(f"✅ New application created: {app_data['id']}")
            
            return app_data["id"], True  # New record created
            
        except Exception as e:
            print(f"❌ Error in store_application: {str(e)}")
            raise Exception(f"Failed to store application: {str(e)}")
    
    async def _copy_component_relationships(
        self,
        user_id: str,
        source_app_id: str,
        target_app_id: str
    ) -> None:
        """
        Copy component relationships from one application to another.
        """
        try:
            # Get all component relationships from source
            # Since application_components has RLS DISABLED, this works fine
            relationships = self.client.table("application_components")\
                .select("component_id")\
                .eq("application_id", source_app_id)\
                .eq("user_id", user_id)\
                .execute()
            
            if relationships.data:
                print(f"📋 Found {len(relationships.data)} component relationships to copy")
                
                # Create new relationships for target application
                new_relationships = [
                    {
                        "application_id": target_app_id,
                        "component_id": rel["component_id"],
                        "user_id": user_id
                    }
                    for rel in relationships.data
                ]
                
                if new_relationships:
                    self.client.table("application_components")\
                        .insert(new_relationships)\
                        .execute()
                    
                    print(f"✅ Copied {len(new_relationships)} component relationships")
            else:
                print(f"⚠️  No component relationships found for source app {source_app_id}")
                
        except Exception as e:
            print(f"⚠️  Warning: Could not copy component relationships: {str(e)}")
            import traceback
            print(f"⚠️  Traceback: {traceback.format_exc()}")
            # Don't fail the entire operation if this fails
    
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
        Store BOTH CycloneDX and SPDX formats.
        """
        
        try:
            component_count = await self._store_components(user_id, app_id, components)
            
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
        user_id: str,
        app_id: str,
        components: List[Dict]
    ) -> int:
        """
        Store components with proper error handling and validation.
        """
        if not components:
            print("⚠️  No components provided to store")
            return 0
        
        print(f"📦 Starting to store {len(components)} components for app {app_id}")
        stored_count = 0
        failed_count = 0
        
        for idx, component in enumerate(components, 1):
            try:
                # Extract and validate component data
                name = str(component.get('name', '')).strip()
                version = str(component.get('version', 'unknown')).strip()
                
                # Skip invalid components
                if not name or name.lower() in ['', 'none', 'unknown', 'null']:
                    print(f"  [{idx}/{len(components)}] ⏭️  Skipped invalid component")
                    failed_count += 1
                    continue
                
                # Generate component ID
                component_id = f"{name}@{version}"
                
                # Check if component exists
                existing_comp = self.client.table("components")\
                    .select("id")\
                    .eq("id", component_id)\
                    .execute()
                
                # Insert component if it doesn't exist
                if not existing_comp.data:
                    component_data = {
                        "id": component_id,
                        "name": name,
                        "version": version,
                        "type": component.get("type", "library"),
                        "license": component.get("license"),
                        "purl": component.get("purl"),
                        "user_id": user_id
                    }
                    
                    try:
                        self.client.table("components").insert(component_data).execute()
                    except Exception as comp_err:
                        # Component might have been inserted by another process
                        if 'duplicate' not in str(comp_err).lower():
                            print(f"  [{idx}/{len(components)}] ⚠️  Component insert error: {str(comp_err)}")
                
                # Check if relationship already exists
                existing_rel = self.client.table("application_components")\
                    .select("id")\
                    .eq("application_id", app_id)\
                    .eq("component_id", component_id)\
                    .execute()
                
                # Only insert if relationship doesn't exist
                if not existing_rel.data:
                    relationship = {
                        "application_id": app_id,
                        "component_id": component_id,
                        "user_id": user_id
                    }
                    
                    result = self.client.table("application_components")\
                        .insert(relationship)\
                        .execute()
                    
                    if result.data:
                        stored_count += 1
                        if idx % 50 == 0:
                            print(f"  Progress: {idx}/{len(components)} processed, {stored_count} stored")
                else:
                    # Already exists, count as stored
                    stored_count += 1
                    
            except Exception as e:
                failed_count += 1
                error_msg = str(e)
                print(f"  [{idx}/{len(components)}] ❌ Error: {component.get('name', 'unknown')}: {error_msg}")
                continue
        
        # Final summary
        print(f"\n📊 Storage Summary for app {app_id}:")
        print(f"  ✅ Successfully stored: {stored_count}/{len(components)}")
        print(f"  ❌ Failed/Skipped: {failed_count}/{len(components)}")
        
        if stored_count == 0 and len(components) > 0:
            print(f"  ⚠️  WARNING: No components were stored! Check errors above.")
        
        return stored_count