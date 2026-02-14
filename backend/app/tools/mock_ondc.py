"""
Mock ONDC API for rapid development
Simulates ONDC mobility and discovery services
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random


class MockONDCService:
    """Mock ONDC Network API for development"""
    
    def __init__(self):
        self.bengaluru_locations = {
            "koramangala": {"lat": 12.9352, "lng": 77.6245},
            "whitefield": {"lat": 12.9698, "lng": 77.7500},
            "indiranagar": {"lat": 12.9716, "lng": 77.6412},
            "jayanagar": {"lat": 12.9250, "lng": 77.5838},
            "marathahalli": {"lat": 12.9591, "lng": 77.6974},
            "mg_road": {"lat": 12.9716, "lng": 77.5946},
            "electronic_city": {"lat": 12.8456, "lng": 77.6603},
        }
    
    async def search_mobility(
        self, 
        pickup: str, 
        dropoff: str, 
        time: str = None
    ) -> List[Dict[str, Any]]:
        """Mock mobility search (Namma Yatri style)"""
        
        # Calculate mock distance
        distance_km = random.uniform(5, 25)
        base_price = distance_km * 15  # ₹15 per km
        
        providers = [
            {
                "provider_id": "namma_yatri_mock",
                "provider_name": "Namma Yatri",
                "vehicle_type": "Auto",
                "estimated_fare": round(base_price * 0.8),
                "estimated_time_minutes": round(distance_km / 20 * 60),
                "distance_km": round(distance_km, 1),
                "available": True,
                "driver_rating": 4.5,
                "note": "Fixed fare, no surge"
            },
            {
                "provider_id": "uber_mock",
                "provider_name": "Uber Auto",
                "vehicle_type": "Auto",
                "estimated_fare": round(base_price * 0.9),
                "estimated_time_minutes": round(distance_km / 20 * 60 + 5),
                "distance_km": round(distance_km, 1),
                "available": True,
                "driver_rating": 4.3,
                "note": "May have surge pricing"
            },
            {
                "provider_id": "rapido_mock",
                "provider_name": "Rapido",
                "vehicle_type": "Bike Taxi",
                "estimated_fare": round(base_price * 0.5),
                "estimated_time_minutes": round(distance_km / 30 * 60),
                "distance_km": round(distance_km, 1),
                "available": True,
                "driver_rating": 4.2,
                "note": "Fastest option"
            }
        ]
        
        return providers
    
    async def search_food(
        self, 
        location: str, 
        query: str = None, 
        cuisine: str = None
    ) -> List[Dict[str, Any]]:
        """Mock food discovery"""
        
        restaurants = [
            {
                "restaurant_id": "vidyarthi_bhavan_mock",
                "name": "Vidyarthi Bhavan",
                "cuisine": "South Indian",
                "rating": 4.6,
                "price_for_two": 200,
                "distance_km": 1.2,
                "delivery_time_minutes": 25,
                "specialties": ["Masala Dosa", "Filter Coffee"],
                "open_now": True,
                "address": "Gandhi Bazaar, Basavanagudi"
            },
            {
                "restaurant_id": "empire_mock",
                "name": "Empire Restaurant",
                "cuisine": "North Indian, Chinese",
                "rating": 4.4,
                "price_for_two": 400,
                "distance_km": 0.8,
                "delivery_time_minutes": 30,
                "specialties": ["Chicken Biryani", "Butter Chicken"],
                "open_now": True,
                "address": "Residency Road"
            },
            {
                "restaurant_id": "mtrs_mock",
                "name": "MTR (Mavalli Tiffin Room)",
                "cuisine": "South Indian",
                "rating": 4.7,
                "price_for_two": 300,
                "distance_km": 2.1,
                "delivery_time_minutes": 35,
                "specialties": ["Rava Idli", "Bisi Bele Bath"],
                "open_now": True,
                "address": "Lalbagh Road"
            },
            {
                "restaurant_id": "taaza_thindi_mock",
                "name": "Taaza Thindi",
                "cuisine": "Street Food",
                "rating": 4.2,
                "price_for_two": 150,
                "distance_km": 0.5,
                "delivery_time_minutes": 15,
                "specialties": ["Gobi Manchurian", "Pani Puri"],
                "open_now": True,
                "address": "VV Puram Food Street"
            }
        ]
        
        # Filter by query if provided
        if query:
            query = query.lower()
            restaurants = [
                r for r in restaurants 
                if query in r["name"].lower() or query in r["cuisine"].lower()
            ]
        
        return restaurants
    
    async def search_places(
        self, 
        location: str, 
        category: str = "all"
    ) -> List[Dict[str, Any]]:
        """Mock place discovery (PGs, gyms, etc)"""
        
        places = {
            "pg": [
                {
                    "place_id": "zolo_mock",
                    "name": "Zolo Stays - Koramangala",
                    "category": "PG/Hostel",
                    "price_per_month": 8500,
                    "rating": 4.3,
                    "amenities": ["WiFi", "AC", "Food", "Laundry"],
                    "distance_km": 1.5,
                    "gender": "Co-ed",
                    "contact": "+91 98765 43210"
                },
                {
                    "place_id": "nestaway_mock",
                    "name": "Nestaway - HSR Layout",
                    "category": "PG/Hostel",
                    "price_per_month": 12000,
                    "rating": 4.5,
                    "amenities": ["WiFi", "AC", "Gym", "Food"],
                    "distance_km": 2.3,
                    "gender": "Male",
                    "contact": "+91 98765 43211"
                }
            ],
            "gym": [
                {
                    "place_id": "cult_mock",
                    "name": "Cult.fit - Indiranagar",
                    "category": "Gym/Fitness",
                    "price_per_month": 2500,
                    "rating": 4.6,
                    "amenities": ["Cardio", "Weights", "Classes", "Showers"],
                    "distance_km": 0.8,
                    "timings": "5 AM - 11 PM",
                    "contact": "+91 98765 43212"
                }
            ],
            "event": [
                {
                    "place_id": "sunday_soul_mock",
                    "name": "Sunday Soul Sante Market",
                    "category": "Event/Market",
                    "price": "Free Entry",
                    "rating": 4.4,
                    "date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "timings": "11 AM - 8 PM",
                    "location": "Jayamahal Palace",
                    "highlights": ["Live Music", "Food Stalls", "Art & Crafts"]
                }
            ]
        }
        
        if category == "all":
            return [item for items in places.values() for item in items]
        
        return places.get(category, [])


# Singleton instance
mock_ondc = MockONDCService()
