from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class ComponentDifference(BaseModel):
    component_name: str
    app1_version: Optional[str] = None
    app2_version: Optional[str] = None
    difference_type: str  # 'version', 'added', 'removed', 'common'
    license_diff: bool = False
    app1_license: Optional[str] = None
    app2_license: Optional[str] = None

class ComparisonSummary(BaseModel):
    total_common: int
    total_unique_app1: int
    total_unique_app2: int
    total_version_differences: int
    similarity_percentage: float
    license_differences: int

class ComparisonResult(BaseModel):
    comparison_id: str
    app1_id: str
    app1_name: str
    app1_platform: str
    app1_component_count: int
    app2_id: str
    app2_name: str
    app2_platform: str
    app2_component_count: int
    summary: ComparisonSummary
    differences: List[ComponentDifference]
    common_components: List[Dict]
    created_at: datetime

class ComparisonRequest(BaseModel):
    app1_id: str
    app2_id: str