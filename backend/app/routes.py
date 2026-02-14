"""
Transport and Discovery API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import logging

router = APIRouter(prefix="/api", tags=["services"])
logger = logging.getLogger(__name__)


# Request/Response Models
class TransportRequest(BaseModel):
    from_location: str
    to_location: str
    mode: Optional[str] = "all"


class PlaceSearchRequest(BaseModel):
    query: str
    location: Optional[str] = None
    category: Optional[str] = None


class Route(BaseModel):
    mode: str
    duration: str
    distance: str
    cost: str
    steps: List[str]


class Place(BaseModel):
    name: str
    address: str
    rating: float
    distance: str
    category: str


# TODO: Replace with actual API integrations
# For now, returning intelligent mock data based on actual Bengaluru locations

@router.post("/transport/search")
async def search_transport(request: TransportRequest):
    """Search for transport routes between two locations"""
    try:
        logger.info(f"Transport search: {request.from_location} → {request.to_location}")
        
        # Mock data - Replace with Mappls API or BMTC/BMRCL integration
        routes = []
        
        if request.mode in ["metro", "all"]:
            routes.append({
                "mode": "Metro",
                "duration": "25 mins",
                "distance": "12 km",
                "cost": "₹40-50",
                "steps": [
                    f"Walk to nearest metro station from {request.from_location}",
                    "Board Purple Line",
                    f"Alight at {request.to_location} station",
                    "5 min walk to destination"
                ],
                "line": "Purple Line",
                "stations": 8
            })
        
        if request.mode in ["bus", "all"]:
            routes.append({
                "mode": "Bus",
                "duration": "35 mins",
                "distance": "14 km",
                "cost": "₹20-30",
                "steps": [
                    f"Board BMTC 500K from {request.from_location}",
                    "30 stops",
                    f"Alight near {request.to_location}"
                ],
                "bus_numbers": ["500K", "G4"]
            })
        
        if request.mode in ["cab", "all"]:
            routes.append({
                "mode": "Cab",
                "duration": "20 mins",
                "distance": "12 km",
                "cost": "₹250-300",
                "steps": [
                    "Book via Namma Yatri or Uber",
                    "Direct route via ORR"
                ],
                "providers": ["Namma Yatri", "Uber", "Ola"]
            })
        
        return {
            "from": request.from_location,
            "to": request.to_location,
            "routes": routes,
            "traffic": "Moderate",
            "best_option": "Metro" if "metro" in [r["mode"].lower() for r in routes] else "Cab"
        }
        
    except Exception as e:
        logger.error(f"Transport search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/discovery/search")
async def search_places(request: PlaceSearchRequest):
    """Search for places using Google Custom Search API"""
    try:
        logger.info(f"Place search: {request.query} in {request.location or 'Bengaluru'}")
        
        # Try Google Custom Search API first
        google_api_key = os.getenv("GOOGLE_API_KEY")
        google_cse_id = os.getenv("GOOGLE_CSE_ID")
        
        if google_api_key and google_cse_id:
            import requests
            
            # Build search query
            search_query = f"{request.query} in {request.location or 'Bengaluru'}"
            
            # Call Google Custom Search API
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": google_api_key,
                "cx": google_cse_id,
                "q": search_query,
                "num": 5
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                places = []
                
                for item in data.get("items", [])[:5]:
                    places.append({
                        "name": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "link": item.get("link", ""),
                        "source": "Google Search"
                    })
                
                return {
                    "query": request.query,
                    "location": request.location or "Bengaluru",
                    "places": places,
                    "count": len(places),
                    "source": "Google Custom Search"
                }
        
        # Fallback to curated Bengaluru data
        query_lower = request.query.lower()
        places = []
        
        if any(word in query_lower for word in ["dosa", "idli", "restaurant", "food", "eat"]):
            places = [
                {
                    "name": "MTR (Mavalli Tiffin Room)",
                    "address": "Lalbagh Road, Bangalore",
                    "rating": 4.5,
                    "distance": "2.3 km",
                    "category": "Restaurant",
                    "specialty": "South Indian breakfast",
                    "price_range": "₹100-200"
                },
                {
                    "name": "Vidyarthi Bhavan",
                    "address": "Gandhi Bazaar, Basavanagudi",
                    "rating": 4.6,
                    "distance": "3.1 km",
                    "category": "Restaurant",
                    "specialty": "Famous masala dosa",
                    "price_range": "₹50-150"
                },
                {
                    "name": "CTR (Central Tiffin Room)",
                    "address": "Malleshwaram",
                    "rating": 4.4,
                    "distance": "5.2 km",
                    "category": "Restaurant",
                    "specialty": "Benne dosa",
                    "price_range": "₹100-200"
                }
            ]
        elif any(word in query_lower for word in ["chinese"]):
            if request.location and "whitefield" in request.location.lower():
                places = [
                    {
                        "name": "Mainland China",
                        "address": "Phoenix Marketcity, Whitefield",
                        "rating": 4.3,
                        "distance": "1.2 km",
                        "category": "Chinese Restaurant",
                        "specialty": "Authentic Chinese cuisine",
                        "price_range": "₹800-1200"
                    },
                    {
                        "name": "Chung Wah",
                        "address": "Whitefield Main Road",
                        "rating": 4.1,
                        "distance": "2.0 km",
                        "category": "Chinese Restaurant", 
                        "specialty": "Indo-Chinese",
                        "price_range": "₹400-600"
                    }
                ]
            else:
                places = [
                    {
                        "name": "Chin Lung",
                        "address": "Church Street",
                        "rating": 4.4,
                        "distance": "3.0 km",
                        "category": "Chinese Restaurant",
                        "specialty": "Cantonese cuisine",
                        "price_range": "₹600-900"
                    }
                ]
        else:
            places = [
                {
                    "name": "Commercial Street",
                    "address": "Commercial Street, Bangalore",
                    "rating": 4.3,
                    "distance": "3.2 km",
                    "category": "Shopping",
                    "specialty": "Shopping district",
                    "price_range": "Varies"
                }
            ]
        
        return {
            "query": request.query,
            "location": request.location or "Bengaluru",
            "places": places,
            "count": len(places),
            "source": "Curated data (Google API not configured)"
        }
        
    except Exception as e:
        logger.error(f"Place search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

