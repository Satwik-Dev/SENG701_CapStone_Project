import subprocess
import json
import tempfile
import os
from typing import Dict, Any, Optional
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
    ) -> Dict[str, Any]:
        
        if not self.check_syft_installed():
            raise Exception("Syft is not installed or not in PATH")
        
        try:
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
            
            print(f"Syft analysis completed successfully")
            
            return sbom_data
            
        except subprocess.TimeoutExpired:
            raise Exception("Syft analysis timed out")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse Syft output: {str(e)}")
        except Exception as e:
            raise Exception(f"SBOM generation failed: {str(e)}")
    
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
    
    def detect_platform_from_sbom(self, sbom_data: Dict[str, Any]) -> str:
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