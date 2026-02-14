"use client";

import { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import RouteSearch from '@/components/transport/RouteSearch';
import RouteDisplay from '@/components/transport/RouteDisplay';
import { transportAgent, type TransportRoute } from '@/lib/agents/transportAgent';

export default function TransportPage() {
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [recommendation, setRecommendation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (origin: string, destination: string) => {
        setIsLoading(true);
        try {
            const [foundRoutes, rec] = await Promise.all([
                transportAgent.searchRoutes(origin, destination),
                transportAgent.getRecommendation(origin, destination),
            ]);

            setRoutes(foundRoutes);
            setRecommendation(rec);
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search routes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto pt-8 pb-4">
                <div className="flex items-center gap-4 mb-6">
                    <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </a>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Transport Planner</h1>
                        <p className="text-gray-400">Find the best route in Bengaluru</p>
                    </div>
                </div>

                {/* Route Search */}
                <RouteSearch onSearch={handleSearch} />

                {/* AI Recommendation */}
                {recommendation && (
                    <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="font-semibold text-blue-200 mb-1">AI Recommendation</h4>
                                <p className="text-blue-100 text-sm">{recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Route Results */}
                <div className="mt-8">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Finding best routes...</p>
                        </div>
                    ) : (
                        <RouteDisplay routes={routes} />
                    )}
                </div>
            </div>
        </main>
    );
}
