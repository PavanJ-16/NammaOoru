"use client";

import { Star, MapPin, IndianRupee } from 'lucide-react';

interface Place {
    id: string;
    name: string;
    category: string;
    address: string;
    rating?: number;
    priceRange?: string;
    tags?: string[];
    distance?: number;
    description?: string;
}

interface PlaceCardProps {
    place: Place;
    onClick?: () => void;
}

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-400">{place.category}</p>
                </div>

                {place.rating && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-600/20 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-white">{place.rating}</span>
                    </div>
                )}
            </div>

            {/* Description */}
            {place.description && (
                <p className="text-sm text-gray-300 mb-3">{place.description}</p>
            )}

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {place.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
                {place.distance !== undefined && (
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{place.distance} km away</span>
                    </div>
                )}

                {place.priceRange && (
                    <div className="flex items-center gap-1 text-green-400">
                        <IndianRupee className="w-4 h-4" />
                        <span>{place.priceRange}</span>
                    </div>
                )}
            </div>

            {/* Address */}
            <p className="text-xs text-gray-500 mt-2">{place.address}</p>
        </div>
    );
}
