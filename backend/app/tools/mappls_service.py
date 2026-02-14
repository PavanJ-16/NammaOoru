"""
Real Mappls (MapmyIndia) API integration
Provides routing, place search, and traffic data for Bengaluru
"""
import os
import httpx
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import json


class MapplsService:
    """Real Mappls API integration"""
    
    def __init__(self):
        self.client_id = os.getenv("MAPPLS_CLIENT_ID")
        self.client_secret = os.getenv("MAPPLS_CLIENT_SECRET")
        self.api_key = os.getenv("MAPPLS_API_KEY")
        
        self.base_url = "https://apis.mappls.com"
        self.access_token = None
        self.token_expiry = None
    
    async def _get_access_token(self) -> str:
        """Get or refresh OAuth access token"""
        # Check if token is still valid
        if self.access_token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.access_token
        
        # Request new token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/advancedmaps/v1/auth/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
            )
            response.raise_for_status()
            
            data = response.json()
            self.access_token = data["access_token"]
            # Token typically expires in 1 hour, refresh 5 mins early
            self.token_expiry = datetime.now() + timedelta(seconds=data.get("expires_in", 3600) - 300)
            
            return self.access_token
    
    async def route(
        self, 
        origin: str,
        destination: str,
        mode: str = "car",  # car, bike, auto
        traffic: bool = True
    ) -> Dict[str, Any]:
        """
        Get route from origin to destination
        
        Args:
            origin: Place name or coordinates (lat,lng)
            destination: Place name or coordinates (lat,lng)
            mode: Transport mode (car, bike, auto)
            traffic: Include real-time traffic
        
        Returns:
            Route data with distance, duration, steps, and polyline
        """
        token = await self._get_access_token()
        
        # If origin/destination are place names, geocode them first
        if not self._is_coordinates(origin):
            origin = await self._geocode(origin)
        if not self._is_coordinates(destination):
            destination = await self._geocode(destination)
        
        # Map mode to Mappls routing profile
        profiles = {
            "car": "driving",
            "bike": "biking",
            "auto": "driving"  # Auto uses driving profile
        }
        profile = profiles.get(mode, "driving")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/advancedmaps/v1/{self.api_key}/route",
                params={
                    "start": origin,
                    "destination": destination,
                    "profile": profile,
                    "overview": "full",
                    "steps": "true",
                    "traffic": "true" if traffic else "false"
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Parse response
            if data.get("routes") and len(data["routes"]) > 0:
                route = data["routes"][0]
                
                return {
                    "distance": {
                        "value": route["distance"],  # meters
                        "text": f"{route['distance'] / 1000:.1f} km"
                    },
                    "duration": {
                        "value": route["duration"],  # seconds
                        "text": f"{int(route['duration'] / 60)} mins"
                    },
                    "traffic_duration": {
                        "value": route.get("traffic_duration", route["duration"]),
                        "text": f"{int(route.get('traffic_duration', route['duration']) / 60)} mins (with traffic)"
                    },
                    "traffic_condition": self._determine_traffic_condition(
                        route["duration"],
                        route.get("traffic_duration", route["duration"])
                    ),
                    "steps": self._format_steps(route.get("legs", [{}])[0].get("steps", [])),
                    "polyline": route.get("geometry", "")
                }
            else:
                raise Exception("No route found")
    
    async def place_search(
        self, 
        query: str,
        location: Optional[Tuple[float, float]] = None,
        radius: int = 5000  # meters
    ) -> List[Dict[str, Any]]:
        """
        Search for places by query
        
        Args:
            query: Search query (e.g., "Koramangala", "restaurants near me")
            location: Optional (lat, lng) for proximity-based search
            radius: Search radius in meters
        
        Returns:
            List of matching places
        """
        token = await self._get_access_token()
        
        params = {
            "query": query,
            "region": "IND"  # India
        }
        
        if location:
            params["location"] = f"{location[0]},{location[1]}"
            params["radius"] = radius
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/advancedmaps/v1/{self.api_key}/place_search",
                params=params,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            
            data = response.json()
            
            places = []
            for result in data.get("results", [])[:5]:  # Top 5 results
                places.append({
                    "place_id": result.get("eLoc", result.get("placeId", "")),
                    "name": result.get("placeName", ""),
                    "address": result.get("placeAddress", ""),
                    "latitude": result.get("latitude", 0),
                    "longitude": result.get("longitude", 0),
                    "type": result.get("type", "locality"),
                    "distance": result.get("distance")  # meters from location if provided
                })
            
            return places
    
    async def nearby_places(
        self, 
        lat: float,
        lng: float,
        category: str = "restaurant",
        radius: int = 1000
    ) -> List[Dict[str, Any]]:
        """
        Find nearby places by category
        
        Args:
            lat: Latitude
            lng: Longitude
            category: Place category (restaurant, atm, hospital, etc)
            radius: Search radius in meters
        
        Returns:
            List of nearby places
        """
        token = await self._get_access_token()
        
        # Map category to Mappls keywords
        category_keywords = {
            "restaurant": "RESTAU",
            "atm": "FINATM",
            "hospital": "HOSPTL",
            "police": "COPOLQ",
            "gas_station": "PETBUN"
        }
        
        keyword = category_keywords.get(category, category.upper())
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/advancedmaps/v1/{self.api_key}/nearby",
                params={
                    "keywords": keyword,
                    "refLocation": f"{lat},{lng}",
                    "radius": radius
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            
            data = response.json()
            
            places = []
            for result in data.get("suggestedLocations", [])[:5]:
                places.append({
                    "place_id": result.get("eLoc", ""),
                    "name": result.get("placeName", ""),
                    "category": category,
                    "latitude": result.get("latitude", 0),
                    "longitude": result.get("longitude", 0),
                    "distance": result.get("distance", 0),  # meters
                    "rating": result.get("rating"),
                    "address": result.get("placeAddress", "")
                })
            
            return places
    
    async def distance_matrix(
        self, 
        origins: List[str],
        destinations: List[str]
    ) -> Dict[str, Any]:
        """
        Calculate distance matrix for multiple origins and destinations
        
        Args:
            origins: List of origin coordinates or place names
            destinations: List of destination coordinates or place names
        
        Returns:
            Distance matrix with durations and distances
        """
        token = await self._get_access_token()
        
        # Geocode if needed
        origin_coords = [await self._geocode(o) if not self._is_coordinates(o) else o for o in origins]
        dest_coords = [await self._geocode(d) if not self._is_coordinates(d) else d for d in destinations]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/advancedmaps/v1/{self.api_key}/distance_matrix/driving",
                json={
                    "origins": origin_coords,
                    "destinations": dest_coords
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "origin_addresses": origins,
                "destination_addresses": destinations,
                "rows": data.get("results", {}).get("rows", [])
            }
    
    # Helper methods
    
    def _is_coordinates(self, location: str) -> bool:
        """Check if location string is coordinates (lat,lng)"""
        try:
            parts = location.split(",")
            return len(parts) == 2 and all(self._is_float(p) for p in parts)
        except:
            return False
    
    def _is_float(self, value: str) -> bool:
        """Check if string can be converted to float"""
        try:
            float(value.strip())
            return True
        except:
            return False
    
    async def _geocode(self, place_name: str) -> str:
        """Convert place name to coordinates"""
        results = await self.place_search(place_name)
        if results:
            return f"{results[0]['latitude']},{results[0]['longitude']}"
        else:
            raise Exception(f"Could not geocode: {place_name}")
    
    def _determine_traffic_condition(self, normal_duration: int, traffic_duration: int) -> str:
        """Determine traffic condition based on duration difference"""
        ratio = traffic_duration / normal_duration if normal_duration > 0 else 1
        
        if ratio < 1.2:
            return "light"
        elif ratio < 1.5:
            return "moderate"
        else:
            return "heavy"
    
    def _format_steps(self, steps: List[Dict]) -> List[Dict[str, Any]]:
        """Format route steps"""
        formatted = []
        for step in steps:
            formatted.append({
                "instruction": step.get("instruction", "Continue"),
                "distance": {
                    "text": f"{step.get('distance', 0) / 1000:.1f} km"
                },
                "duration": {
                    "text": f"{int(step.get('duration', 0) / 60)} mins"
                }
            })
        return formatted


# Singleton instance
mappls_service = MapplsService()
