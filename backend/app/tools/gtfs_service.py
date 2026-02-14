"""
Real GTFS integration for BMTC and BMRCL (Namma Metro)
Fetches live transit data from public APIs
"""
import os
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import csv
import io


class GTFSService:
    """Real GTFS data service for BMTC buses and Namma Metro"""
    
    def __init__(self):
        self.bmtc_url = os.getenv("BMTC_GTFS_URL", "https://iudx.org.in/bmtc")
        self.bmrcl_url = os.getenv("BMRCL_GTFS_URL", "https://opendata.bengaluru.gov.in/bmrcl")
        
        # Cache GTFS data for 1 hour
        self._cache = {}
        self._cache_expiry = {}
    
    async def _fetch_gtfs_feed(self, url: str, feed_type: str) -> Dict:
        """Fetch and parse GTFS feed"""
        cache_key = f"{url}_{feed_type}"
        
        # Check cache
        if cache_key in self._cache:
            if datetime.now() < self._cache_expiry.get(cache_key, datetime.now()):
                return self._cache[cache_key]
        
        # Fetch fresh data
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(f"{url}/{feed_type}.txt")
                response.raise_for_status()
                
                # Parse CSV
                data = []
                csv_reader = csv.DictReader(io.StringIO(response.text))
                for row in csv_reader:
                    data.append(row)
                
                # Cache for 1 hour
                self._cache[cache_key] = data
                self._cache_expiry[cache_key] = datetime.now() + timedelta(hours=1)
                
                return data
            
            except Exception as e:
                print(f"Error fetching GTFS feed {feed_type}: {e}")
                return []
    
    async def search_routes(
        self, 
        origin: str,
        destination: str
    ) -> List[Dict[str, Any]]:
        """
        Find bus/metro routes between origin and destination
        
        Args:
            origin: Origin place name
            destination: Destination place name
        
        Returns:
            List of available routes (buses and metro)
        """
        routes = []
        
        # Search BMTC routes
        bmtc_routes = await self._search_bmtc_routes(origin, destination)
        routes.extend(bmtc_routes)
        
        # Search Metro routes
        metro_routes = await self._search_metro_routes(origin, destination)
        routes.extend(metro_routes)
        
        return routes
    
    async def _search_bmtc_routes(self, origin: str, destination: str) -> List[Dict[str, Any]]:
        """Search BMTC bus routes"""
        # Fetch routes and stops
        routes_data = await self._fetch_gtfs_feed(self.bmtc_url, "routes")
        trips_data = await self._fetch_gtfs_feed(self.bmtc_url, "trips")
        stop_times_data = await self._fetch_gtfs_feed(self.bmtc_url, "stop_times")
        stops_data = await self._fetch_gtfs_feed(self.bmtc_url, "stops")
        
        # Build stop name to ID mapping
        stop_map = {stop["stop_name"].lower(): stop for stop in stops_data}
        
        # Find stops matching origin and destination
        origin_stops = [s for name, s in stop_map.items() if origin.lower() in name]
        dest_stops = [s for name, s in stop_map.items() if destination.lower() in name]
        
        if not origin_stops or not dest_stops:
            return []
        
        matching_routes = []
        
        # Find routes that connect these stops
        for trip in trips_data[:100]:  # Limit for performance
            route_id = trip["route_id"]
            trip_id = trip["trip_id"]
            
            # Get stops for this trip
            trip_stops = [st for st in stop_times_data if st["trip_id"] == trip_id]
            trip_stop_ids = [st["stop_id"] for st in trip_stops]
            
            # Check if both origin and destination are in this trip
            origin_in_trip = any(s["stop_id"] in trip_stop_ids for s in origin_stops)
            dest_in_trip = any(s["stop_id"] in trip_stop_ids for s in dest_stops)
            
            if origin_in_trip and dest_in_trip:
                # Find the route info
                route_info = next((r for r in routes_data if r["route_id"] == route_id), None)
                
                if route_info:
                    # Calculate journey details
                    origin_idx = next((i for i, st in enumerate(trip_stops) 
                                     if any(s["stop_id"] == st["stop_id"] for s in origin_stops)), 0)
                    dest_idx = next((i for i, st in enumerate(trip_stops) 
                                   if any(s["stop_id"] == st["stop_id"] for s in dest_stops)), len(trip_stops)-1)
                    
                    if origin_idx < dest_idx:
                        stops_count = dest_idx - origin_idx + 1
                        duration_mins = stops_count * 5  # Avg 5 mins per stop
                        
                        matching_routes.append({
                            "type": "direct_bus",
                            "route_id": route_info["route_short_name"],
                            "route_name": route_info["route_long_name"],
                            "operator": "BMTC",
                            "from_stop": trip_stops[origin_idx]["stop_name"] if origin_idx < len(trip_stops) else origin,
                            "to_stop": trip_stops[dest_idx]["stop_name"] if dest_idx < len(trip_stops) else destination,
                            "stops_count": stops_count,
                            "duration_minutes": duration_mins,
                            "fare": self._calculate_bmtc_fare(stops_count),
                            "frequency_mins": 15,  # Default
                            "ac": "Vayu Vajra" in route_info.get("route_long_name", ""),
                            "next_arrival_mins": 5  # Mock real-time
                        })
        
        return matching_routes[:3]  # Return top 3
    
    async def _search_metro_routes(self, origin: str, destination: str) -> List[Dict[str, Any]]:
        """Search Namma Metro routes"""
        # Fetch metro data
        routes_data = await self._fetch_gtfs_feed(self.bmrcl_url, "routes")
        stops_data = await self._fetch_gtfs_feed(self.bmrcl_url, "stops")
        stop_times_data = await self._fetch_gtfs_feed(self.bmrcl_url, "stop_times")
        
        # Build stop mapping
        stop_map = {stop["stop_name"].lower(): stop for stop in stops_data}
        
        # Find matching stops
        origin_stops = [s for name, s in stop_map.items() if origin.lower() in name]
        dest_stops = [s for name, s in stop_map.items() if destination.lower() in name]
        
        if not origin_stops or not dest_stops:
            return []
        
        matching_routes = []
        
        # Check each metro line
        for route in routes_data:
            # Get all stops on this line
            line_stops = [st for st in stop_times_data if st["route_id"] == route["route_id"]]
            line_stop_ids = [st["stop_id"] for st in line_stops]
            
            # Check if both stops are on this line
            origin_on_line = any(s["stop_id"] in line_stop_ids for s in origin_stops)
            dest_on_line = any(s["stop_id"] in line_stop_ids for s in dest_stops)
            
            if origin_on_line and dest_on_line:
                origin_idx = next((i for i, st in enumerate(line_stops) 
                                 if any(s["stop_id"] == st["stop_id"] for s in origin_stops)), 0)
                dest_idx = next((i for i, st in enumerate(line_stops) 
                               if any(s["stop_id"] == st["stop_id"] for s in dest_stops)), len(line_stops)-1)
                
                if origin_idx < dest_idx:
                    stations_count = dest_idx - origin_idx + 1
                    duration_mins = stations_count * 3  # 3 mins per station
                    distance_km = stations_count * 1.5  # 1.5 km per station avg
                    fare = 10 + int(distance_km * 2)  # ₹10 base + ₹2/km
                    
                    matching_routes.append({
                        "type": "metro",
                        "line_id": route["route_short_name"],
                        "line_name": route["route_long_name"],
                        "operator": "Namma Metro (BMRCL)",
                        "from_station": line_stops[origin_idx]["stop_name"] if origin_idx < len(line_stops) else origin,
                        "to_station": line_stops[dest_idx]["stop_name"] if dest_idx < len(line_stops) else destination,
                        "stations_count": stations_count,
                        "duration_minutes": duration_mins,
                        "fare": fare,
                        "frequency_mins": 10,
                        "next_arrival_mins": 3
                    })
        
        return matching_routes
    
    async def get_live_arrivals(
        self, 
        stop_name: str,
        route_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get live arrival predictions for a stop
        
        Note: Real-time data requires GTFS-Realtime feed or API
        This implementation uses schedule-based predictions
        """
        # Fetch stop times
        stop_times = await self._fetch_gtfs_feed(self.bmtc_url, "stop_times")
        stops = await self._fetch_gtfs_feed(self.bmtc_url, "stops")
        routes = await self._fetch_gtfs_feed(self.bmtc_url, "routes")
        
        # Find the stop
        matching_stops = [s for s in stops if stop_name.lower() in s["stop_name"].lower()]
        
        if not matching_stops:
            return []
        
        stop_id = matching_stops[0]["stop_id"]
        
        # Get upcoming arrivals (schedule-based)
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        
        arrivals = []
        for st in stop_times:
            if st["stop_id"] == stop_id:
                # Calculate minutes until arrival
                arrival_time = st.get("arrival_time", "")
                if arrival_time:
                    # Simple time diff calculation
                    arrival_mins = self._time_diff_minutes(current_time, arrival_time)
                    
                    if 0 <= arrival_mins <= 60:  # Next hour only
                        route_info = next((r for r in routes if r["route_id"] == st["route_id"]), None)
                        
                        if route_info:
                            arrivals.append({
                                "route_id": route_info["route_short_name"],
                                "route_name": route_info["route_long_name"],
                                "arrival_mins": arrival_mins,
                                "destination": route_info.get("route_desc", ""),
                                "crowding": "medium",  # Mock
                                "ac": "Vayu Vajra" in route_info.get("route_long_name", "")
                            })
        
        return sorted(arrivals, key=lambda x: x["arrival_mins"])[:5]
    
    def _calculate_bmtc_fare(self, stops: int) -> int:
        """Calculate BMTC fare based on stops/distance"""
        if stops <= 5:
            return 10
        elif stops <= 10:
            return 15
        elif stops <= 15:
            return 20
        else:
            return 25
    
    def _time_diff_minutes(self, time1: str, time2: str) -> int:
        """Calculate difference between two times in minutes"""
        try:
            t1 = datetime.strptime(time1, "%H:%M:%S")
            t2 = datetime.strptime(time2, "%H:%M:%S")
            diff = (t2 - t1).total_seconds() / 60
            return int(diff)
        except:
            return 0


# Singleton instance
gtfs_service = GTFSService()
