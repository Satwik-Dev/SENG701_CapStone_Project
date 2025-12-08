from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.api.deps import get_current_user_id
from app.core.database import get_supabase_client
from supabase import Client
from typing import Optional, Dict, List, Any
from collections import defaultdict
import json

router = APIRouter(prefix="/stats", tags=["Statistics"])

# Predefined options - always show these even if count is 0
PREDEFINED_PLATFORMS = ['android', 'ios', 'windows', 'macos', 'linux', 'unknown']
PREDEFINED_BINARY_TYPES = ['mobile', 'desktop', 'server', 'container', 'library', 'unknown']


@router.get("/overview")
async def get_stats_overview(
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Get comprehensive statistics overview for the user's SBOMs.
    """
    try:
        # Fetch all user applications with SBOM data
        apps_response = supabase_client.table("applications").select(
            "id, name, platform, os, binary_type, status, component_count, "
            "sbom_data, spdx_data, created_at"
        ).eq("user_id", user_id).execute()
        
        apps = apps_response.data or []
        completed_apps = [app for app in apps if app.get('status') == 'completed']
        
        if not apps:
            return _get_empty_stats()
        
        # Calculate totals
        total_apps = len(apps)
        total_completed = len(completed_apps)
        total_components = sum(app.get('component_count', 0) or 0 for app in completed_apps)
        
        # Group by Binary Type (replaces Category)
        by_binary_type = _group_by_field_with_defaults(
            completed_apps, 'binary_type', PREDEFINED_BINARY_TYPES
        )
        
        # Group by Platform (always show all platforms)
        by_platform = _group_by_field_with_defaults(
            completed_apps, 'platform', PREDEFINED_PLATFORMS
        )
        
        # Group by Operating System (extracted from 'os' or 'platform')
        by_os = _group_by_operating_system(completed_apps)
        
        # Extract Supplier from SBOM data
        by_supplier = _extract_suppliers_from_sboms(completed_apps)
        
        # Extract Manufacturer from SBOM data
        by_manufacturer = _extract_manufacturers_from_sboms(completed_apps)
        
        # Group by Status (all apps)
        by_status = _group_and_count(apps, 'status')
        
        return {
            "total_applications": total_apps,
            "total_completed": total_completed,
            "total_components": total_components,
            "avg_components_per_app": round(total_components / total_completed, 1) if total_completed > 0 else 0,
            "by_binary_type": by_binary_type,
            "by_operating_system": by_os,
            "by_supplier": by_supplier,
            "by_manufacturer": by_manufacturer,
            "by_platform": by_platform,
            "by_status": by_status
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


@router.get("/component-types")
async def get_component_type_stats(
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Get distribution of component types, licenses, and languages."""
    try:
        # Get all user's completed applications with SBOM data
        apps_response = supabase_client.table("applications").select(
            "id, sbom_data"
        ).eq("user_id", user_id).eq("status", "completed").execute()
        
        if not apps_response.data:
            return {
                "by_type": [],
                "by_license": [],
                "by_language": [],
                "total_components": 0
            }
        
        # Count by type, license, and language - extract from SBOM data directly
        type_counts = defaultdict(int)
        license_counts = defaultdict(int)
        language_counts = defaultdict(int)
        
        for app in apps_response.data:
            sbom_data = app.get('sbom_data')
            if not sbom_data or not isinstance(sbom_data, dict):
                continue
            
            components = sbom_data.get('components', [])
            for comp in components:
                # Count by type
                comp_type = comp.get('type') or 'unknown'
                type_counts[comp_type] += 1
                
                # Count by license - check licenses array first, then individual fields
                license_val = None
                licenses = comp.get('licenses', [])
                if licenses and isinstance(licenses, list) and len(licenses) > 0:
                    first_license = licenses[0]
                    if isinstance(first_license, dict):
                        license_obj = first_license.get('license', {})
                        if isinstance(license_obj, dict):
                            license_val = license_obj.get('id') or license_obj.get('name')
                        elif isinstance(license_obj, str):
                            license_val = license_obj
                
                if not license_val:
                    license_val = 'Unknown'
                license_val = _clean_license_name(license_val)
                license_counts[license_val] += 1
                
                # Extract language from properties array (Syft stores it there)
                lang = _extract_language_from_properties(comp)
                if not lang:
                    # Fallback: infer from purl or type
                    purl = comp.get('purl', '')
                    lang = _infer_language_from_purl(purl) or _infer_language_from_type(comp_type)
                
                language_counts[lang] += 1
        
        return {
            "by_type": [
                {"name": k, "count": v} 
                for k, v in sorted(type_counts.items(), key=lambda x: -x[1])
            ],
            "by_license": [
                {"name": k, "count": v} 
                for k, v in sorted(license_counts.items(), key=lambda x: -x[1])[:20]
            ],
            "by_language": [
                {"name": k, "count": v} 
                for k, v in sorted(language_counts.items(), key=lambda x: -x[1])
            ],
            "total_components": sum(type_counts.values())
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch component statistics: {str(e)}"
        )


# ============ Helper Functions ============

def _get_empty_stats() -> Dict[str, Any]:
    """Return empty statistics structure."""
    return {
        "total_applications": 0,
        "total_completed": 0,
        "total_components": 0,
        "avg_components_per_app": 0,
        "by_binary_type": [{"name": bt.capitalize(), "count": 0, "total_components": 0} for bt in PREDEFINED_BINARY_TYPES],
        "by_operating_system": [],
        "by_supplier": [],
        "by_manufacturer": [],
        "by_platform": [{"name": p.capitalize(), "count": 0, "total_components": 0} for p in PREDEFINED_PLATFORMS],
        "by_status": []
    }


def _group_and_count(apps: List[Dict], field: str) -> List[Dict]:
    """Group applications by a field and count occurrences."""
    counts = defaultdict(lambda: {"count": 0, "total_components": 0})
    
    for app in apps:
        value = app.get(field)
        if value is None or value == '':
            value = "unknown"
        counts[value]["count"] += 1
        counts[value]["total_components"] += app.get('component_count', 0) or 0
    
    return [
        {
            "name": k, 
            "count": v["count"], 
            "total_components": v["total_components"]
        }
        for k, v in sorted(counts.items(), key=lambda x: -x[1]["count"])
    ]


def _group_by_field_with_defaults(
    apps: List[Dict], 
    field: str, 
    predefined_values: List[str]
) -> List[Dict]:
    """
    Group applications by a field, ensuring all predefined values are included.
    Shows all options even if count is 0.
    """
    # Initialize with all predefined values
    counts = {v: {"count": 0, "total_components": 0} for v in predefined_values}
    
    for app in apps:
        value = app.get(field)
        if value is None or value == '':
            value = "unknown"
        value = value.lower() if isinstance(value, str) else str(value)
        
        if value not in counts:
            counts[value] = {"count": 0, "total_components": 0}
        
        counts[value]["count"] += 1
        counts[value]["total_components"] += app.get('component_count', 0) or 0
    
    # Sort: items with count > 0 first (by count desc), then items with count = 0
    result = [
        {"name": k.capitalize(), "count": v["count"], "total_components": v["total_components"]}
        for k, v in counts.items()
    ]
    result.sort(key=lambda x: (-x["count"], x["name"]))
    
    return result


def _group_by_operating_system(apps: List[Dict]) -> List[Dict]:
    """
    Group applications by OS, extracting from 'os' field or inferring from platform.
    """
    counts = defaultdict(lambda: {"count": 0, "total_components": 0})
    
    for app in apps:
        # Try to get OS, fallback to platform
        os_value = app.get('os')
        if not os_value or os_value == '':
            platform = app.get('platform', '')
            os_value = _platform_to_os(platform)
        
        if not os_value:
            os_value = "Unknown"
        
        counts[os_value]["count"] += 1
        counts[os_value]["total_components"] += app.get('component_count', 0) or 0
    
    return [
        {"name": k, "count": v["count"], "total_components": v["total_components"]}
        for k, v in sorted(counts.items(), key=lambda x: -x[1]["count"])
    ]


def _platform_to_os(platform: str) -> str:
    """Map platform to OS name."""
    mapping = {
        'android': 'Android',
        'ios': 'iOS',
        'windows': 'Windows',
        'macos': 'macOS',
        'linux': 'Linux'
    }
    return mapping.get(platform.lower() if platform else '', 'Unknown')


def _extract_suppliers_from_sboms(apps: List[Dict]) -> List[Dict]:
    """
    Extract supplier information from SBOM data.
    Looks in CycloneDX metadata and SPDX packages.
    """
    supplier_counts = defaultdict(lambda: {"count": 0, "total_components": 0})
    
    for app in apps:
        supplier = None
        
        # Try CycloneDX format
        sbom_data = app.get('sbom_data')
        if sbom_data and isinstance(sbom_data, dict):
            # Check metadata.component.supplier
            metadata = sbom_data.get('metadata', {})
            component = metadata.get('component', {})
            supplier_obj = component.get('supplier', {})
            supplier = supplier_obj.get('name') if isinstance(supplier_obj, dict) else supplier_obj
            
            # Also check metadata.supplier
            if not supplier:
                meta_supplier = metadata.get('supplier', {})
                supplier = meta_supplier.get('name') if isinstance(meta_supplier, dict) else None
            
            # Try to extract from components if not in metadata
            if not supplier:
                components = sbom_data.get('components', [])
                suppliers = set()
                for comp in components[:50]:  # Check first 50 components
                    comp_supplier = comp.get('supplier', {})
                    if isinstance(comp_supplier, dict):
                        s = comp_supplier.get('name')
                        if s:
                            suppliers.add(s)
                    elif isinstance(comp_supplier, str) and comp_supplier:
                        suppliers.add(comp_supplier)
                if suppliers:
                    supplier = list(suppliers)[0]  # Take first supplier found
        
        # Try SPDX format
        if not supplier:
            spdx_data = app.get('spdx_data')
            if spdx_data and isinstance(spdx_data, dict):
                packages = spdx_data.get('packages', [])
                for pkg in packages[:50]:
                    s = pkg.get('supplier') or pkg.get('originator')
                    if s and s != 'NOASSERTION':
                        # Clean up "Organization: xxx" format
                        if s.startswith('Organization:'):
                            s = s.replace('Organization:', '').strip()
                        if s.startswith('Person:'):
                            s = s.replace('Person:', '').strip()
                        supplier = s
                        break
        
        # Default if nothing found
        if not supplier:
            supplier = "Not specified in SBOM"
        
        supplier_counts[supplier]["count"] += 1
        supplier_counts[supplier]["total_components"] += app.get('component_count', 0) or 0
    
    return [
        {"name": k, "count": v["count"], "total_components": v["total_components"]}
        for k, v in sorted(supplier_counts.items(), key=lambda x: -x[1]["count"])
    ]


def _extract_manufacturers_from_sboms(apps: List[Dict]) -> List[Dict]:
    """
    Extract manufacturer information from SBOM data.
    Note: We avoid using tools section as that shows SBOM generator (Syft/Anchore), not app manufacturer.
    """
    manufacturer_counts = defaultdict(lambda: {"count": 0, "total_components": 0})
    
    for app in apps:
        manufacturer = None
        
        # Try CycloneDX format
        sbom_data = app.get('sbom_data')
        if sbom_data and isinstance(sbom_data, dict):
            metadata = sbom_data.get('metadata', {})
            component = metadata.get('component', {})
            
            # Check manufacturer field (actual app manufacturer, not tool)
            mfr = component.get('manufacturer', {})
            if isinstance(mfr, dict) and mfr.get('name'):
                # Skip if it's Anchore (that's the SBOM tool, not app manufacturer)
                mfr_name = mfr.get('name', '')
                if 'anchore' not in mfr_name.lower() and 'syft' not in mfr_name.lower():
                    manufacturer = mfr_name
            elif isinstance(mfr, str) and mfr:
                if 'anchore' not in mfr.lower() and 'syft' not in mfr.lower():
                    manufacturer = mfr
            
            # Check author as fallback (but not tool authors)
            if not manufacturer:
                author = component.get('author')
                if author and 'anchore' not in author.lower() and 'syft' not in author.lower():
                    manufacturer = author
            
            # Check publisher
            if not manufacturer:
                publisher = component.get('publisher')
                if publisher and 'anchore' not in publisher.lower() and 'syft' not in publisher.lower():
                    manufacturer = publisher
            
            # Try to extract from component suppliers (aggregate top suppliers)
            if not manufacturer:
                components = sbom_data.get('components', [])
                supplier_counts = defaultdict(int)
                for comp in components[:100]:  # Check first 100 components
                    comp_supplier = comp.get('supplier', {})
                    if isinstance(comp_supplier, dict):
                        s = comp_supplier.get('name')
                        if s and 'anchore' not in s.lower() and 'syft' not in s.lower():
                            supplier_counts[s] += 1
                    elif isinstance(comp_supplier, str) and comp_supplier:
                        if 'anchore' not in comp_supplier.lower() and 'syft' not in comp_supplier.lower():
                            supplier_counts[comp_supplier] += 1
                
                # Get the most common supplier as manufacturer
                if supplier_counts:
                    manufacturer = max(supplier_counts.items(), key=lambda x: x[1])[0]
        
        # Try SPDX format
        if not manufacturer:
            spdx_data = app.get('spdx_data')
            if spdx_data and isinstance(spdx_data, dict):
                # Check creation info - but filter out tool entries
                creation_info = spdx_data.get('creationInfo', {})
                creators = creation_info.get('creators', [])
                for creator in creators:
                    if creator and 'Tool:' not in creator:
                        if creator.startswith('Organization:'):
                            org = creator.replace('Organization:', '').strip()
                            if 'anchore' not in org.lower() and 'syft' not in org.lower():
                                manufacturer = org
                                break
        
        # Default if nothing found
        if not manufacturer:
            manufacturer = "Not specified in SBOM"
        
        manufacturer_counts[manufacturer]["count"] += 1
        manufacturer_counts[manufacturer]["total_components"] += app.get('component_count', 0) or 0
    
    return [
        {"name": k, "count": v["count"], "total_components": v["total_components"]}
        for k, v in sorted(manufacturer_counts.items(), key=lambda x: -x[1]["count"])
    ]


def _infer_language_from_type(comp_type: str) -> str:
    """Infer programming language from component type."""
    type_to_language = {
        'npm': 'JavaScript',
        'nodejs': 'JavaScript',
        'yarn': 'JavaScript',
        'node-module': 'JavaScript',
        'pypi': 'Python',
        'pip': 'Python',
        'python': 'Python',
        'wheel': 'Python',
        'egg': 'Python',
        'maven': 'Java',
        'gradle': 'Java',
        'java': 'Java',
        'java-archive': 'Java',
        'go-module': 'Go',
        'golang': 'Go',
        'cargo': 'Rust',
        'rust': 'Rust',
        'crates': 'Rust',
        'nuget': 'C#/.NET',
        'dotnet': 'C#/.NET',
        'gem': 'Ruby',
        'rubygems': 'Ruby',
        'ruby': 'Ruby',
        'composer': 'PHP',
        'php': 'PHP',
        'packagist': 'PHP',
        'cocoapods': 'Swift/Obj-C',
        'swift': 'Swift',
        'carthage': 'Swift/Obj-C',
        'hex': 'Elixir',
        'cpan': 'Perl',
        'hackage': 'Haskell',
        'pub': 'Dart',
        'dart': 'Dart',
        'conan': 'C/C++',
        'vcpkg': 'C/C++',
        'deb': 'System Package',
        'rpm': 'System Package',
        'apk': 'System Package',
        'alpm': 'System Package',
        'binary': 'Binary',
    }
    
    comp_type_lower = comp_type.lower() if comp_type else ''
    
    for key, lang in type_to_language.items():
        if key in comp_type_lower:
            return lang
    
    return 'Other'


def _extract_language_from_properties(component: Dict) -> Optional[str]:
    """
    Extract programming language from component's properties array.
    Syft stores language info as: {"name": "syft:package:language", "value": "javascript"}
    """
    properties = component.get('properties', [])
    if not properties or not isinstance(properties, list):
        return None
    
    for prop in properties:
        if isinstance(prop, dict):
            prop_name = prop.get('name', '')
            prop_value = prop.get('value', '')
            
            # Check for Syft's language property
            if prop_name == 'syft:package:language' and prop_value:
                # Capitalize the language name
                return prop_value.capitalize()
            
            # Also check for generic language property
            if prop_name == 'language' and prop_value:
                return prop_value.capitalize()
    
    return None


def _infer_language_from_purl(purl: str) -> Optional[str]:
    """
    Infer programming language from Package URL (purl).
    Example: pkg:npm/%40ampproject/remapping@2.2.1 -> JavaScript
    """
    if not purl:
        return None
    
    purl_lower = purl.lower()
    
    purl_to_language = {
        'pkg:npm/': 'JavaScript',
        'pkg:pypi/': 'Python',
        'pkg:maven/': 'Java',
        'pkg:gradle/': 'Java',
        'pkg:go/': 'Go',
        'pkg:golang/': 'Go',
        'pkg:cargo/': 'Rust',
        'pkg:crates/': 'Rust',
        'pkg:nuget/': 'C#/.NET',
        'pkg:gem/': 'Ruby',
        'pkg:composer/': 'PHP',
        'pkg:packagist/': 'PHP',
        'pkg:cocoapods/': 'Swift/Obj-C',
        'pkg:swift/': 'Swift',
        'pkg:hex/': 'Elixir',
        'pkg:cpan/': 'Perl',
        'pkg:hackage/': 'Haskell',
        'pkg:pub/': 'Dart',
        'pkg:conan/': 'C/C++',
        'pkg:deb/': 'System Package',
        'pkg:rpm/': 'System Package',
        'pkg:apk/': 'System Package',
    }
    
    for prefix, lang in purl_to_language.items():
        if purl_lower.startswith(prefix):
            return lang
    
    return None


def _clean_license_name(license_name: str) -> str:
    """Clean up and standardize license names."""
    if not license_name:
        return 'Unknown'
    
    # Common replacements
    license_name = license_name.strip()
    
    # Handle NOASSERTION
    if license_name.upper() in ['NOASSERTION', 'NONE', 'UNKNOWN', '']:
        return 'Unknown'
    
    return license_name