from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_current_user_id
from app.core.database import get_supabase_client
from supabase import Client
from typing import Optional, List, Dict, Any
from rapidfuzz import fuzz, process
import json
import re


router = APIRouter(prefix="/applications", tags=["Applications"])


def normalize_text(text: str) -> str:
    """
    Normalize text for better matching (like Google does).
    - Convert to lowercase
    - Remove special characters
    - Remove extra whitespace
    - Handle common abbreviations
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters but keep spaces and alphanumeric
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text


def extract_search_terms(query: str) -> Dict[str, Any]:
    """
    Extract search terms and operators (Google-like).
    Supports:
    - Quoted phrases: "exact match"
    - OR operator: term1 OR term2
    - Minus exclusion: -excluded
    - Multiple words: automatic AND
    """
    query = query.strip()
    
    # Extract quoted phrases
    quoted_phrases = re.findall(r'"([^"]+)"', query)
    
    # Remove quoted phrases from query for further processing
    query_without_quotes = re.sub(r'"[^"]+"', '', query)
    
    # Extract excluded terms (words with -)
    excluded_terms = re.findall(r'-(\w+)', query_without_quotes)
    
    # Remove excluded terms from query
    query_without_excluded = re.sub(r'-\w+', '', query_without_quotes)
    
    # Check for OR operator
    has_or = ' OR ' in query_without_excluded.upper()
    
    # Split into terms
    terms = query_without_excluded.split()
    terms = [t.strip() for t in terms if t.strip() and t.upper() != 'OR']
    
    return {
        'original_query': query,
        'quoted_phrases': quoted_phrases,
        'excluded_terms': excluded_terms,
        'search_terms': terms,
        'has_or': has_or
    }


def calculate_relevance_score(app: Dict, search_data: Dict) -> Dict[str, Any]:
    """
    Calculate relevance score using multiple factors (Google-like ranking).
    
    Factors:
    1. Exact matches (highest priority)
    2. Starts with query (high priority)
    3. Word boundary matches
    4. Partial matches
    5. Fuzzy matches
    6. Field importance (name > version > platform > type)
    """
    
    query = search_data['original_query'].lower()
    quoted_phrases = search_data['quoted_phrases']
    excluded_terms = search_data['excluded_terms']
    search_terms = search_data['search_terms']
    
    # Initialize score components
    scores = {
        'exact_match': 0,
        'starts_with': 0,
        'word_boundary': 0,
        'partial_match': 0,
        'fuzzy_match': 0,
        'field_weight': 0
    }
    
    # Field weights (like Google ranks titles higher than body)
    field_weights = {
        'name': 10,
        'version': 5,
        'platform': 3,
        'binary_type': 3,
        'manufacturer': 2,
        'supplier': 2
    }
    
    match_field = None
    best_field_score = 0
    
    # Process each field
    for field_name, weight in field_weights.items():
        field_value = str(app.get(field_name, '')).lower()
        if not field_value or field_value == 'none':
            continue
        
        field_score = 0
        
        # 1. Check for exact phrase matches (quoted)
        for phrase in quoted_phrases:
            if phrase.lower() in field_value:
                field_score += 100 * weight
                scores['exact_match'] += 100
        
        # 2. Check for excluded terms
        for excluded in excluded_terms:
            if excluded.lower() in field_value:
                # If excluded term found, return very low score
                return {
                    'total_score': 0,
                    'match_field': None,
                    'details': scores
                }
        
        # 3. Exact match with full query
        if normalize_text(field_value) == normalize_text(query):
            field_score += 95 * weight
            scores['exact_match'] += 95
        
        # 4. Starts with query
        if field_value.startswith(query):
            field_score += 85 * weight
            scores['starts_with'] += 85
        
        # 5. Check each search term
        for term in search_terms:
            term = term.lower()
            
            # Exact word match (word boundary)
            if re.search(r'\b' + re.escape(term) + r'\b', field_value):
                field_score += 70 * weight
                scores['word_boundary'] += 70
            
            # Starts with term
            elif field_value.startswith(term):
                field_score += 60 * weight
                scores['starts_with'] += 60
            
            # Contains term
            elif term in field_value:
                field_score += 50 * weight
                scores['partial_match'] += 50
            
            # Fuzzy match using RapidFuzz
            else:
                fuzzy_score = fuzz.partial_ratio(term, field_value)
                if fuzzy_score > 70:
                    field_score += (fuzzy_score / 100) * 40 * weight
                    scores['fuzzy_match'] += fuzzy_score / 100 * 40
        
        # Track which field had the best match
        if field_score > best_field_score:
            best_field_score = field_score
            match_field = field_name
            scores['field_weight'] = weight
    
    # Calculate total score
    total_score = sum(scores.values())
    
    # Boost for multiple term matches (like Google boosts pages with all search terms)
    if len(search_terms) > 1:
        # Check how many terms matched
        matched_terms = 0
        all_text = ' '.join([
            str(app.get(f, '')).lower() 
            for f in field_weights.keys()
        ])
        
        for term in search_terms:
            if term.lower() in all_text:
                matched_terms += 1
        
        # Bonus for matching all terms
        if matched_terms == len(search_terms):
            total_score *= 1.5
        elif matched_terms > 0:
            total_score *= (1 + (matched_terms / len(search_terms)) * 0.3)
    
    return {
        'total_score': round(total_score, 2),
        'match_field': match_field,
        'details': scores
    }


@router.get("/search")
async def search_applications(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Google-like fuzzy search with advanced features:
    - Partial matching
    - Fuzzy matching (typo tolerance)
    - Phrase search with quotes: "exact phrase"
    - Exclusion with minus: -excluded
    - OR operator: term1 OR term2
    - Smart relevance ranking
    - Multi-field search
    """
    
    try:
        # Fetch all user's applications
        response = supabase_client.table("applications").select(
            "id, name, version, platform, status, component_count, file_size, "
            "created_at, analyzed_at, binary_type, os, manufacturer, supplier, sbom_format"
        ).eq("user_id", user_id).execute()
        
        if not response.data:
            return {
                "items": [],
                "query": query,
                "total_results": 0,
                "search_metadata": {
                    "has_quoted_phrases": False,
                    "has_excluded_terms": False,
                    "has_or_operator": False,
                    "search_terms": []
                }
            }
        
        applications = response.data
        
        # Extract search terms and operators
        search_data = extract_search_terms(query)
        
        # Calculate relevance scores for all applications
        scored_results = []
        
        for app in applications:
            relevance = calculate_relevance_score(app, search_data)
            
            # Only include results with score > 0
            if relevance['total_score'] > 0:
                app_result = app.copy()
                app_result['similarity_score'] = min(100, relevance['total_score'])
                app_result['match_field'] = relevance['match_field']
                app_result['relevance_details'] = relevance['details']
                scored_results.append(app_result)
        
        # Sort by relevance score (descending) - like Google
        scored_results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Limit results
        scored_results = scored_results[:limit]
        
        # Calculate similarity percentage (0-100)
        for result in scored_results:
            result['similarity_score'] = round(min(100, result['similarity_score']), 2)
        
        return {
            "items": scored_results,
            "query": query,
            "total_results": len(scored_results),
            "search_metadata": {
                "has_quoted_phrases": len(search_data['quoted_phrases']) > 0,
                "has_excluded_terms": len(search_data['excluded_terms']) > 0,
                "has_or_operator": search_data['has_or'],
                "search_terms": search_data['search_terms'],
                "quoted_phrases": search_data['quoted_phrases'],
                "excluded_terms": search_data['excluded_terms']
            }
        }
        
    except Exception as e:
        # Log the error for debugging
        print(f"Search error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/")
async def list_applications(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    platform: Optional[str] = None,
    status: Optional[str] = None,
    binary_type: Optional[str] = Query(None),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        query = supabase_client.table("applications").select(
            "id, name, version, platform, status, component_count, file_size, "
            "created_at, analyzed_at, binary_type, os, manufacturer, supplier, sbom_format",
            count="exact"
        ).eq("user_id", user_id)
        
        if platform:
            query = query.eq("platform", platform)
        
        if status:
            query = query.eq("status", status)
        
        if binary_type:
            query = query.eq("binary_type", binary_type)
        
        offset = (page - 1) * limit
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        response = query.execute()
        
        total = response.count if hasattr(response, 'count') else len(response.data)
        total_pages = (total + limit - 1) // limit
        
        return {
            "items": response.data,
            "total": total,
            "page": page,
            "page_size": limit,
            "total_pages": total_pages
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications: {str(e)}"
        )


@router.get("/{app_id}")
async def get_application(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        response = supabase_client.table("applications").select(
            "*"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        app_data = response.data[0]
        
        components_response = supabase_client.table("application_components").select(
            "components(id, name, version, type, language, license, purl, description)"
        ).eq("application_id", app_id).execute()
        
        components = []
        for item in components_response.data:
            if item.get("components"):
                components.append(item["components"])
        
        app_data["components"] = components
        
        return app_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch application: {str(e)}"
        )


@router.get("/{app_id}/components")
async def get_application_components(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        app_response = supabase_client.table("applications").select(
            "id"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not app_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        components_response = supabase_client.table("application_components").select(
            "components(id, name, version, type, language, license, purl, description, supplier, homepage)"
        ).eq("application_id", app_id).execute()
        
        components = []
        for item in components_response.data:
            if item.get("components"):
                components.append(item["components"])
        
        return {
            "application_id": app_id,
            "components": components,
            "total_components": len(components)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch components: {str(e)}"
        )


@router.get("/{app_id}/export")
async def export_sbom(
    app_id: str,
    format: str = Query("cyclonedx", regex="^(cyclonedx|spdx)$"),
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Export SBOM in requested format (CycloneDX or SPDX).
    """
    
    try:
        response = supabase_client.table("applications").select(
            "sbom_data, spdx_data, name, sbom_format"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        app_data = response.data[0]
        
        if format == "cyclonedx":
            sbom_data = app_data.get("sbom_data")
        elif format == "spdx":
            sbom_data = app_data.get("spdx_data")
        else:
            sbom_data = app_data.get("sbom_data")
        
        if not sbom_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"SBOM data in {format} format not available for this application"
            )
        
        return sbom_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export SBOM: {str(e)}"
        )


@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    user_id: str = Depends(get_current_user_id),
    supabase_client: Client = Depends(get_supabase_client)
):
    
    try:
        app_response = supabase_client.table("applications").select(
            "storage_path"
        ).eq("id", app_id).eq("user_id", user_id).execute()
        
        if not app_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        storage_path = app_response.data[0].get("storage_path")
        
        supabase_client.table("application_components").delete().eq(
            "application_id", app_id
        ).execute()
        
        supabase_client.table("applications").delete().eq(
            "id", app_id
        ).execute()
        
        if storage_path:
            try:
                file_path = storage_path.replace("uploads/", "")
                supabase_client.storage.from_("uploads").remove([file_path])
            except Exception as e:
                print(f"Failed to delete file from storage: {str(e)}")
        
        return {
            "message": "Application deleted successfully",
            "application_id": app_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete application: {str(e)}"
        )