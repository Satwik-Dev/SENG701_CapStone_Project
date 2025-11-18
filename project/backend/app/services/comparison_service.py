from typing import Dict, List, Tuple
from app.models.comparison import (
    ComparisonResult, 
    ComparisonSummary, 
    ComponentDifference
)
from supabase import Client
import uuid
from datetime import datetime

class ComparisonService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    async def compare_applications(
        self, 
        app1_id: str, 
        app2_id: str, 
        user_id: str
    ) -> ComparisonResult:
        """
        Compare two applications and return detailed differences.
        """
        # Fetch both applications
        app1 = await self._get_application(app1_id, user_id)
        app2 = await self._get_application(app2_id, user_id)
        
        # Fetch components for both apps
        app1_components = await self._get_components(app1_id)
        app2_components = await self._get_components(app2_id)
        
        # Perform comparison
        comparison_data = self._perform_comparison(
            app1, app1_components,
            app2, app2_components
        )
        
        # Save comparison result (optional - for history)
        comparison_id = str(uuid.uuid4())
        
        return ComparisonResult(
            comparison_id=comparison_id,
            app1_id=app1['id'],
            app1_name=app1['name'],
            app1_platform=app1['platform'],
            app1_component_count=app1['component_count'],
            app2_id=app2['id'],
            app2_name=app2['name'],
            app2_platform=app2['platform'],
            app2_component_count=app2['component_count'],
            summary=comparison_data['summary'],
            differences=comparison_data['differences'],
            common_components=comparison_data['common_components'],
            created_at=datetime.utcnow()
        )
    
    async def _get_application(self, app_id: str, user_id: str) -> Dict:
        """Fetch application details."""
        response = self.supabase.table("applications")\
            .select("*")\
            .eq("id", app_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not response.data:
            raise ValueError(f"Application {app_id} not found")
        
        return response.data
    
    async def _get_components(self, app_id: str) -> List[Dict]:
        """Fetch components for an application."""
        response = self.supabase.table("application_components")\
            .select("component_id, components(*)")\
            .eq("application_id", app_id)\
            .execute()
        
        components = []
        for item in response.data:
            comp = item['components']
            if comp:
                components.append(comp)
        
        return components
    
    def _perform_comparison(
        self, 
        app1: Dict, 
        app1_components: List[Dict],
        app2: Dict, 
        app2_components: List[Dict]
    ) -> Dict:
        """Core comparison logic."""
        
        # Create lookup dictionaries
        app1_comp_map = {
            (c['name'], c['type']): c for c in app1_components
        }
        app2_comp_map = {
            (c['name'], c['type']): c for c in app2_components
        }
        
        common_components = []
        differences = []
        
        # Find common and version differences
        for key, comp1 in app1_comp_map.items():
            if key in app2_comp_map:
                comp2 = app2_comp_map[key]
                
                # Check if versions differ
                if comp1['version'] != comp2['version']:
                    differences.append(ComponentDifference(
                        component_name=comp1['name'],
                        app1_version=comp1['version'],
                        app2_version=comp2['version'],
                        difference_type='version',
                        license_diff=comp1.get('license') != comp2.get('license'),
                        app1_license=comp1.get('license'),
                        app2_license=comp2.get('license')
                    ))
                else:
                    common_components.append({
                        'name': comp1['name'],
                        'version': comp1['version'],
                        'type': comp1['type'],
                        'license': comp1.get('license')
                    })
        
        # Find components unique to app1
        unique_to_app1 = []
        for key, comp in app1_comp_map.items():
            if key not in app2_comp_map:
                differences.append(ComponentDifference(
                    component_name=comp['name'],
                    app1_version=comp['version'],
                    app2_version=None,
                    difference_type='removed',
                    app1_license=comp.get('license')
                ))
                unique_to_app1.append(comp)
        
        # Find components unique to app2
        unique_to_app2 = []
        for key, comp in app2_comp_map.items():
            if key not in app1_comp_map:
                differences.append(ComponentDifference(
                    component_name=comp['name'],
                    app1_version=None,
                    app2_version=comp['version'],
                    difference_type='added',
                    app2_license=comp.get('license')
                ))
                unique_to_app2.append(comp)
        
        # Calculate similarity
        total_unique = len(app1_comp_map) + len(app2_comp_map)
        if total_unique > 0:
            similarity = (2 * len(common_components)) / total_unique * 100
        else:
            similarity = 0.0
        
        # Count license differences
        license_diffs = sum(1 for d in differences if d.license_diff)
        
        summary = ComparisonSummary(
            total_common=len(common_components),
            total_unique_app1=len(unique_to_app1),
            total_unique_app2=len(unique_to_app2),
            total_version_differences=sum(
                1 for d in differences if d.difference_type == 'version'
            ),
            similarity_percentage=round(similarity, 2),
            license_differences=license_diffs
        )
        
        return {
            'summary': summary,
            'differences': differences,
            'common_components': common_components
        }