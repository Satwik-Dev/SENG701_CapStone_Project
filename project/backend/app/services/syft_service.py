import subprocess
import json
import tempfile
import os
from typing import Dict, Any, Optional, Tuple
from pathlib import Path


class SyftService:
    
    def __init__(self):
        self.syft_binary = "syft"
    
    def check_syft_installed(self) -> bool:
        try:
            result = subprocess.run(
                [self.syft_binary, "version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0
        except Exception:
            return False
    
    async def generate_sbom(
        self, 
        file_path: str, 
        output_format: str = "cyclonedx-json"
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Generate SBOM in BOTH CycloneDX and SPDX formats.
        Returns: (cyclonedx_data, spdx_data)
        """
        
        if not self.check_syft_installed():
            raise Exception("Syft is not installed or not in PATH")
        
        try:
            # Generate CycloneDX SBOM
            cyclonedx_data = await self._run_syft(file_path, "cyclonedx-json")
            
            # Generate SPDX SBOM
            spdx_data = await self._run_syft(file_path, "spdx-json")
            
            return cyclonedx_data, spdx_data
            
        except Exception as e:
            raise Exception(f"SBOM generation failed: {str(e)}")
    
    async def _run_syft(self, file_path: str, output_format: str) -> Dict[str, Any]:
        """Run Syft with specified format."""
        
        with tempfile.NamedTemporaryFile(
            mode='w+', 
            suffix='.json', 
            delete=False
        ) as temp_output:
            output_file = temp_output.name
        
        cmd = [
            self.syft_binary,
            "scan",
            file_path,
            "-o", output_format,
            "--file", output_file
        ]
        
        print(f"Running Syft: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout
            raise Exception(f"Syft analysis failed: {error_msg}")
        
        with open(output_file, 'r', encoding='utf-8') as f:
            sbom_data = json.load(f)
        
        os.unlink(output_file)
        
        return sbom_data
    
    def parse_cyclonedx_components(self, sbom_data: Dict[str, Any]) -> list:
        components = []
        
        for comp in sbom_data.get("components", []):
            component = {
                "name": comp.get("name"),
                "version": comp.get("version"),
                "type": comp.get("type"),
                "purl": comp.get("purl"),
                "license": self._extract_license(comp),
                "description": comp.get("description"),
            }
            
            if "properties" in comp:
                for prop in comp["properties"]:
                    if prop.get("name") == "syft:language":
                        component["language"] = prop.get("value")
            
            components.append(component)
        
        return components
    
    def parse_spdx_components(self, sbom_data: Dict[str, Any]) -> list:
        components = []
        
        for package in sbom_data.get("packages", []):
            component = {
                "name": package.get("name"),
                "version": package.get("versionInfo"),
                "type": "library",
                "purl": self._extract_purl_from_spdx(package),
                "license": package.get("licenseConcluded"),
                "description": package.get("description"),
                "supplier": package.get("supplier"),
                "homepage": package.get("homepage"),
            }
            
            components.append(component)
        
        return components
    
    def _extract_license(self, component: Dict) -> Optional[str]:
        licenses = component.get("licenses", [])
        if licenses and len(licenses) > 0:
            license_obj = licenses[0].get("license", {})
            return license_obj.get("id") or license_obj.get("name")
        return None
    
    def _extract_purl_from_spdx(self, package: Dict) -> Optional[str]:
        external_refs = package.get("externalRefs", [])
        for ref in external_refs:
            if ref.get("referenceType") == "purl":
                return ref.get("referenceLocator")
        return None
    
    def detect_platform_from_file(self, filename: str) -> str:
        """
        Detect platform from filename extension.
        This is more reliable than content analysis.
        """
        filename_lower = filename.lower()
        
        # Mobile platforms
        if filename_lower.endswith('.apk'):
            return 'android'
        if filename_lower.endswith('.ipa'):
            return 'ios'
        
        # Desktop platforms
        if filename_lower.endswith('.exe') or filename_lower.endswith('.msi'):
            return 'windows'
        if filename_lower.endswith('.app') or filename_lower.endswith('.dmg'):
            return 'macos'
        if filename_lower.endswith('.deb') or filename_lower.endswith('.rpm'):
            return 'linux'
        
        # Archives - try to detect from content
        if filename_lower.endswith(('.zip', '.tar', '.tar.gz', '.tgz')):
            return 'unknown'
        
        return 'unknown'
    
    def detect_platform_from_sbom(self, sbom_data: Dict[str, Any]) -> str:
        """Fallback: detect from SBOM content."""
        components = sbom_data.get("components", []) or sbom_data.get("packages", [])
        
        for comp in components:
            name = comp.get("name", "").lower()
            purl = comp.get("purl", "").lower()
            
            if "android" in name or "androidx" in name or "pkg:maven" in purl:
                return "android"
            
            if "swift" in name or "cocoapods" in purl or "pkg:cocoapods" in purl:
                return "ios"
            
            if "pkg:npm" in purl:
                return "unknown"
            
            if "pkg:pypi" in purl:
                return "unknown"
        
        return "unknown"