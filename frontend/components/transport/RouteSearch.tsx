"use client";

import { useState } from 'react';
import { MapPin, Bus, Train, Navigation, Loader2 } from 'lucide-react';

interface RouteSearchProps {
    onSearch: (origin: string, destination: string) => void;
}

export default function RouteSearch({ onSearch }: RouteSearchProps) {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!origin || !destination) {
            alert('Please enter both origin and destination');
            return;
        }

        setIsSearching(true);
        await onSearch(origin, destination);
        setIsSearching(false);
    };

    const popularDestinations = [
        'Koramangala',
        'Indiranagar',
        'MG Road',
        'Jayanagar',
        'Whitefield',
        'Electronic City',
    ];

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            {/* Origin Input */}
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Starting point (e.g., Koramangala)"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Destination Input */}
            <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where to? (e.g., MG Road)"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={isSearching || !origin || !destination}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {isSearching ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching routes...
                    </>
                ) : (
                    <>
                        <Bus className="w-5 h-5" />
                        Find Routes
                    </>
                )}
            </button>

            {/* Quick Destinations */}
            <div className="pt-2">
                <p className="text-sm text-gray-400 mb-2">Popular destinations:</p>
                <div className="flex flex-wrap gap-2">
                    {popularDestinations.map((place) => (
                        <button
                            key={place}
                            onClick={() => setDestination(place)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition-colors"
                        >
                            {place}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
