"""
Mock Mappls API for rapid development
Simulates routing, place search, and distance matrix
"""
from typing import List, Dict, Any, Tuple
import random
from datetime import datetime, timedelta


class MockMapplsService:
    """Mock Mappls (MapmyIndia) API for development"""
    
    def __init__(self):
        self.bengaluru_pois = {
            "koramangala": (12.9352, 77.6245, "Koramangala, Bengaluru"),
            "whitefield": (12.9698, 77.7500, "Whitefield, Bengaluru"),
            "indiranagar": (12.9716, 77.6412, "Indiranagar, Bengaluru"),
            "jayanagar": (12.9250, 77.5838, "Jayanagar, Bengaluru"),
            "marathahalli": (12.9591, 77.6974, "Marathahalli, Bengaluru"),
            "mg_road": (12.9716, 77.5946, "MG Road, Bengaluru"),
            "electronic_city": (12.8456, 77.6603, "Electronic City, Bengaluru"),
            "kr_puram": (13.0096, 77.6969, "KR Puram, Bengaluru"),
            "btm_layout": (12.9165, 77.6101, "BTM Layout, Bengaluru"),
            "hsr_layout": (12.9121, 77.6446, "HSR Layout, Bengaluru"),
        }
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Mock distance calculation (straight line)"""
        # Simplified distance in km
        return ((lat2 - lat1)**2 + (lng2 - lng1)**2)**0.5 * 111  # 111 km per degree
    
    async def route(
        self, 
        origin: str,
        destination: str,
        mode: str = "car"  # car, bike, auto
    ) -> Dict[str, Any]:
        """Mock routing API"""
        
        # Get coordinates
        origin_data = self.bengaluru_pois.get(origin.lower().replace(" ", "_"))
        dest_data = self.bengaluru_pois.get(destination.lower().replace(" ", "_"))
        
        if not origin_data or not dest_data:
            # Default to random route
            distance_km = random.uniform(5, 25)
        else:
            distance_km = self._calculate_distance(
                origin_data[0], origin_data[1],
                dest_data[0], dest_data[1]
            )
        
        # Traffic multiplier
        traffic_factor = random.uniform(1.2, 1.8)
        
        # Speed by mode
        speeds = {"car": 25, "bike": 30, "auto": 20}  # km/h average
        duration_minutes = (distance_km / speeds.get(mode, 25)) * 60 * traffic_factor
        
        route = {
            "distance": {
                "value": distance_km * 1000,  # meters
                "text": f"{distance_km:.1f} km"
            },
            "duration": {
                "value": duration_minutes * 60,  # seconds
                "text": f"{int(duration_minutes)} mins"
            },
            "traffic_duration": {
                "value": duration_minutes * 60,
                "text": f"{int(duration_minutes)} mins (with traffic)"
            },
            "traffic_condition": random.choice(["light", "moderate", "heavy"]),
            "steps": [
                {
                    "instruction": f"Head towards {destination.title()}",
                    "distance": {"text": f"{distance_km * 0.3:.1f} km"},
                    "duration": {"text": f"{int(duration_minutes * 0.3)} mins"}
                },
                {
                    "instruction": f"Continue on Outer Ring Road",
                    "distance": {"text": f"{distance_km * 0.5:.1f} km"},
                    "duration": {"text": f"{int(duration_minutes * 0.5)} mins"}
                },
                {
                    "instruction": f"Arrive at {destination.title()}",
                    "distance": {"text": f"{distance_km * 0.2:.1f} km"},
                    "duration": {"text": f"{int(duration_minutes * 0.2)} mins"}
                }
            ],
            "polyline": "mock_encoded_polyline_" + "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=20))
        }
        
        return route
    
    async def place_search(
        self, 
        query: str,
        location: Tuple[float, float] = None,
        radius: int = 5000  # meters
    ) -> List[Dict[str, Any]]:
        """Mock place search"""
        
        query_lower = query.lower()
        matching_places = []
        
        for key, (lat, lng, name) in self.bengaluru_pois.items():
            if query_lower in key or query_lower in name.lower():
                matching_places.append({
                    "place_id": f"mock_{key}",
                    "name": name,
                    "address": f"{name}, Karnataka 560001",
                    "latitude": lat,
                    "longitude": lng,
                    "type": "locality",
                    "distance": random.uniform(0.5, 5) if location else None
                })
        
        # Add some generic results
        if len(matching_places) < 3:
            matching_places.extend([
                {
                    "place_id": f"mock_generic_{i}",
                    "name": f"{query.title()} - Area {i+1}",
                    "address": f"Bengaluru, Karnataka 560{random.randint(10, 99)}",
                    "latitude": 12.9 + random.uniform(-0.1, 0.1),
                    "longitude": 77.6 + random.uniform(-0.1, 0.1),
                    "type": "locality",
                    "distance": random.uniform(1, 10)
                }
                for i in range(3 - len(matching_places))
            ])
        
        return matching_places[:5]  # Return top 5
    
    async def nearby_places(
        self, 
        lat: float,
        lng: float,
        category: str = "restaurant",
        radius: int = 1000
    ) -> List[Dict[str, Any]]:
        """Mock nearby places search"""
        
        categories_map = {
            "restaurant": ["Karavalli", "Toit", "Truffles", "Koshys"],
            "atm": ["SBI ATM", "HDFC ATM", "ICICI ATM", "Axis Bank ATM"],
            "hospital": ["Apollo Hospital", "Fortis Hospital", "Manipal Hospital"],
            "police": ["Police Station - Koramangala", "Traffic Police Booth"],
            "gas_station": ["Indian Oil Petrol Pump", "HP Petrol Pump"]
        }
        
        places = categories_map.get(category, ["Generic Place 1", "Generic Place 2"])
        
        return [
            {
                "place_id": f"mock_nearby_{i}",
                "name": name,
                "category": category,
                "latitude": lat + random.uniform(-0.01, 0.01),
                "longitude": lng + random.uniform(-0.01, 0.01),
                "distance": random.uniform(100, radius),
                "rating": round(random.uniform(3.5, 4.8), 1),
                "address": f"{name}, Bengaluru"
            }
            for i, name in enumerate(places[:5])
        ]
    
    async def distance_matrix(
        self, 
        origins: List[str],
        destinations: List[str]
    ) -> Dict[str, Any]:
        """Mock distance matrix"""
        
        matrix = {
            "origin_addresses": origins,
            "destination_addresses": destinations,
            "rows": []
        }
        
        for origin in origins:
            row = {"elements": []}
            for dest in destinations:
                if origin == dest:
                    element = {
                        "distance": {"value": 0, "text": "0 km"},
                        "duration": {"value": 0, "text": "0 mins"}
                    }
                else:
                    distance = random.uniform(5, 30)
                    duration = (distance / 25) * 60  # 25 km/h average
                    element = {
                        "distance": {"value": int(distance * 1000), "text": f"{distance:.1f} km"},
                        "duration": {"value": int(duration * 60), "text": f"{int(duration)} mins"}
                    }
                row["elements"].append(element)
            matrix["rows"].append(row)
        
        return matrix


# Singleton instance
mock_mappls = MockMapplsService()
