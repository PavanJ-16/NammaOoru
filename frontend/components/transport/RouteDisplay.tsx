"use client";

import { Bus, Train, Clock, IndianRupee, Users } from 'lucide-react';

interface RouteOption {
    type: 'bus' | 'metro' | 'auto';
    routeId?: string;
    routeName?: string;
    lineName?: string;
    operator: string;
    fromStop: string;
    toStop: string;
    duration: number;
    fare: number;
    stopsCount?: number;
    nextArrival?: number;
    crowding?: 'low' | 'medium' | 'high';
    ac?: boolean;
}

interface RouteDisplayProps {
    routes: RouteOption[];
    onSelectRoute?: (route: RouteOption) => void;
}

export default function RouteDisplay({ routes, onSelectRoute }: RouteDisplayProps) {
    if (routes.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <Bus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No routes found. Try searching for a destination.</p>
            </div>
        );
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'metro':
                return <Train className="w-6 h-6 text-purple-400" />;
            case 'bus':
                return <Bus className="w-6 h-6 text-green-400" />;
            default:
                return <Bus className="w-6 h-6 text-yellow-400" />;
        }
    };

    const getCrowdingColor = (crowding?: string) => {
        switch (crowding) {
            case 'low':
                return 'text-green-400';
            case 'medium':
                return 'text-yellow-400';
            case 'high':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
                Found {routes.length} route{routes.length !== 1 ? 's' : ''}
            </h3>

            {routes.map((route, index) => (
                <div
                    key={index}
                    onClick={() => onSelectRoute?.(route)}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {getTypeIcon(route.type)}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-semibold text-white">
                                        {route.type === 'metro' ? route.lineName : route.routeId}
                                    </h4>
                                    {route.ac && (
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                            AC
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">{route.operator}</p>
                            </div>
                        </div>

                        {/* Fare */}
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-green-400 font-semibold">
                                <IndianRupee className="w-4 h-4" />
                                <span>{route.fare}</span>
                            </div>
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>{route.fromStop}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300 pl-4">
                            <div className="flex-1 border-l-2 border-dashed border-gray-600 h-6"></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span>{route.toStop}</span>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{route.duration} mins</span>
                        </div>

                        {route.stopsCount && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{route.stopsCount} stops</span>
                            </div>
                        )}

                        {route.nextArrival !== undefined && (
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Clock className="w-4 h-4" />
                                <span>Next in {route.nextArrival} mins</span>
                            </div>
                        )}

                        {route.crowding && (
                            <div className={`flex items-center gap-1 ${getCrowdingColor(route.crowding)}`}>
                                <Users className="w-4 h-4" />
                                <span className="capitalize">{route.crowding}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function MapPin({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}
