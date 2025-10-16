from supabase import Client
from typing import Dict, Any, List
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
    ) -> str:
        
        try:
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
            
            return app_data["id"]
            
        except Exception as e:
            raise Exception(f"Failed to store application: {str(e)}")
    
    async def update_application_sbom(
        self,
        app_id: str,
        sbom_data: Dict[str, Any],
        components: List[Dict],
        platform: str = "unknown"
    ) -> None:
        
        try:
            component_count = await self._store_components(app_id, components)
            
            update_data = {
                "sbom_data": sbom_data,
                "sbom_format": "cyclonedx" if "bomFormat" in sbom_data else "spdx",
                "component_count": component_count,
                "platform": platform,
                "status": "completed",
                "analyzed_at": datetime.utcnow().isoformat()
            }
            
            self.client.table("applications").update(update_data).eq("id", app_id).execute()
            
            print(f"Stored {component_count} components for application {app_id}")
            
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
        
        stored_count = 0
        
        for comp_data in components:
            try:
                existing = self.client.table("components").select("id").eq(
                    "name", comp_data["name"]
                ).eq("version", comp_data.get("version", "")).execute()
                
                if existing.data:
                    component_id = existing.data[0]["id"]
                else:
                    component = {
                        "id": str(uuid.uuid4()),
                        "name": comp_data["name"],
                        "version": comp_data.get("version"),
                        "type": comp_data.get("type"),
                        "language": comp_data.get("language"),
                        "license": comp_data.get("license"),
                        "purl": comp_data.get("purl"),
                        "description": comp_data.get("description"),
                        "supplier": comp_data.get("supplier"),
                        "homepage": comp_data.get("homepage"),
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
                    response = self.client.table("components").insert(component).execute()
                    component_id = component["id"]
                
                relationship = {
                    "id": str(uuid.uuid4()),
                    "application_id": app_id,
                    "component_id": component_id,
                    "relationship_type": "direct",
                    "created_at": datetime.utcnow().isoformat()
                }
                
                self.client.table("application_components").insert(relationship).execute()
                stored_count += 1
                
            except Exception as e:
                print(f"Failed to store component {comp_data.get('name')}: {str(e)}")
                continue
        
        return stored_count