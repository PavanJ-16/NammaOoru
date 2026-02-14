"""
Mock GTFS (BMTC + BMRCL) for rapid development
Simulates bus and metro schedules
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random


class MockGTFSService:
    """Mock GTFS data for BMTC buses and Namma Metro"""
    
    def __init__(self):
        self._initialize_routes()
    
    def _initialize_routes(self):
        """Initialize mock BMTC and Metro routes"""
        
        # Mock BMTC bus routes
        self.bmtc_routes = {
            "335E": {
                "route_id": "335E",
                "route_name": "Kengeri Bus Station to Whitefield",
                "route_type": "bus",
                "operator": "BMTC",
                "stops": [
                    "Kengeri Bus Station",
                    "RV College",
                    "Jayanagar 4th Block",
                    "Lalbagh",
                    "Shivajinagar",
                    "MG Road",
                    "Indiranagar",
                    "Marathahalli",
                    "Whitefield"
                ],
                "frequency_mins": 15,
                "fare": 45,
                "ac": False
            },
            "500K": {
                "route_id": "500K",
                "route_name": "Kempegowda Bus Station to Electronic City",
                "route_type": "bus",
                "operator": "BMTC Vayu Vajra (AC)",
                "stops": [
                    "Kempegowda Bus Station",
                    "Lalbagh",
                    "Jayanagar",
                    "BTM Layout",
                    "Silk Board",
                    "HSR Layout",
                    "Electronic City"
                ],
                "frequency_mins": 20,
                "fare": 80,
                "ac": True
            },
            "G4": {
                "route_id": "G4",
                "route_name": "Banashankari to KR Puram",
                "route_type": "bus",
                "operator": "BMTC",
                "stops": [
                    "Banashankari",
                    "JP Nagar",
                    "BTM Layout",
                    "Koramangala",
                    "MG Road",
                    "Indiranagar",
                    "Marathahalli",
                    "KR Puram"
                ],
                "frequency_mins": 12,
                "fare": 40,
                "ac": False
            }
        }
        
        # Mock Metro lines
        self.metro_lines = {
            "purple": {
                "line_id": "purple",
                "line_name": "Purple Line (Challaghatta - Whitefield)",
                "route_type": "metro",
                "operator": "Namma Metro (BMRCL)",
                "stations": [
                    "Challaghatta",
                    "Kengeri",
                    "Mysore Road",
                    "Deepanjali Nagar",
                    "Attiguppe",
                    "Vijayanagar",
                    "Hosahalli",
                    "Magadi Road",
                    "Mahalakshmi",
                    "Sandal Soap Factory",
                    "Rajajinagar",
                    "Kuvempu Road",
                    "Srirampura",
                    "Sampige Road",
                    "Majestic",
                    "MG Road",
                    "Trinity",
                    "Halasuru",
                    "Indiranagar",
                    "Baiyappanahalli",
                    "Whitefield"
                ],
                "frequency_mins": 8,
                "fare_base": 10,
                "fare_per_km": 2
            },
            "green": {
                "line_id": "green",
                "line_name": "Green Line (Nagasandra - Silk Institute)",
                "route_type": "metro",
                "operator": "Namma Metro (BMRCL)",
                "stations": [
                    "Nagasandra",
                    "Dasarahalli",
                    "Jalahalli",
                    "Peenya Industry",
                    "Peenya",
                    "Goraguntepalya",
                    "Yeshwanthpur",
                    "Mahalakshmi",
                    "Rajajinagar",
                    "Kuvempu Road",
                    "Srirampura",
                    "Krantiveera Sangolli Rayanna (Majestic)",
                    "Chickpet",
                    "Krishna Rajendra Market",
                    "National College",
                    "Lalbagh",
                    "South End Circle",
                    "Jayanagar",
                    "Rashtriya Vidyalaya Road",
                    "Banashankari",
                    "Silk Institute"
                ],
                "frequency_mins": 10,
                "fare_base": 10,
                "fare_per_km": 2
            }
        }
    
    async def search_routes(
        self, 
        origin: str,
        destination: str
    ) -> List[Dict[str, Any]]:
        """Find bus/metro routes between origin and destination"""
        
        origin_lower = origin.lower()
        dest_lower = destination.lower()
        
        routes = []
        
        # Search BMTC routes
        for route_id, route_data in self.bmtc_routes.items():
            stops_lower = [s.lower() for s in route_data["stops"]]
            
            origin_match = any(origin_lower in stop for stop in stops_lower)
            dest_match = any(dest_lower in stop for stop in stops_lower)
            
            if origin_match and dest_match:
                # Find indices
                origin_idx = next((i for i, s in enumerate(stops_lower) if origin_lower in s), 0)
                dest_idx = next((i for i, s in enumerate(stops_lower) if dest_lower in s), len(stops_lower) - 1)
                
                if origin_idx < dest_idx:
                    duration_mins = (dest_idx - origin_idx) * 8  # 8 mins per stop
                    
                    routes.append({
                        "type": "direct_bus",
                        "route_id": route_id,
                        "route_name": route_data["route_name"],
                        "operator": route_data["operator"],
                        "from_stop": route_data["stops"][origin_idx],
                        "to_stop": route_data["stops"][dest_idx],
                        "stops_count": dest_idx - origin_idx + 1,
                        "duration_minutes": duration_mins,
                        "fare": route_data["fare"],
                        "frequency_mins": route_data["frequency_mins"],
                        "ac": route_data["ac"],
                        "next_arrival_mins": random.randint(2, route_data["frequency_mins"])
                    })
        
        # Search Metro routes
        for line_id, line_data in self.metro_lines.items():
            stations_lower = [s.lower() for s in line_data["stations"]]
            
            origin_match = any(origin_lower in station for station in stations_lower)
            dest_match = any(dest_lower in station for station in stations_lower)
            
            if origin_match and dest_match:
                origin_idx = next((i for i, s in enumerate(stations_lower) if origin_lower in s), 0)
                dest_idx = next((i for i, s in enumerate(stations_lower) if dest_lower in s), len(stations_lower) - 1)
                
                if origin_idx < dest_idx:
                    stops = dest_idx - origin_idx
                    duration_mins = stops * 3  # 3 mins per station
                    distance_km = stops * 1.5  # avg 1.5 km per station
                    fare = line_data["fare_base"] + int(distance_km * line_data["fare_per_km"])
                    
                    routes.append({
                        "type": "metro",
                        "line_id": line_id,
                        "line_name": line_data["line_name"],
                        "operator": line_data["operator"],
                        "from_station": line_data["stations"][origin_idx],
                        "to_station": line_data["stations"][dest_idx],
                        "stations_count": stops + 1,
                        "duration_minutes": duration_mins,
                        "fare": fare,
                        "frequency_mins": line_data["frequency_mins"],
                        "next_arrival_mins": random.randint(1, line_data["frequency_mins"])
                    })
        
        return routes
    
    async def get_live_arrivals(
        self, 
        stop_name: str,
        route_id: str = None
    ) -> List[Dict[str, Any]]:
        """Mock live bus/metro arrivals"""
        
        arrivals = []
        
        # Generate 3-5 random arrivals
        for i in range(random.randint(3, 5)):
            route = random.choice(list(self.bmtc_routes.values()))
            
            arrivals.append({
                "route_id": route["route_id"],
                "route_name": route["route_name"],
                "arrival_mins": random.randint(2, 20),
                "destination": route["stops"][-1],
                "crowding": random.choice(["low", "medium", "high"]),
                "ac": route["ac"]
            })
        
        return sorted(arrivals, key=lambda x: x["arrival_mins"])


# Singleton instance
mock_gtfs = MockGTFSService()
