"use client";

import { useState } from 'react';
import { ArrowLeft, UtensilsCrossed, Coffee, ShoppingBag, Hospital } from 'lucide-react';
import PlaceCard from '@/components/discovery/PlaceCard';
import { discoveryAgent, type DiscoveryPlace } from '@/lib/agents/discoveryAgent';

export default function DiscoveryPage() {
    const [category, setCategory] = useState<string>('food');
    const [places, setPlaces] = useState<DiscoveryPlace[]>([]);
    const [recommendation, setRecommendation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const categories = [
        { id: 'food', name: 'Food', icon: UtensilsCrossed },
        { id: 'cafe', name: 'Cafes', icon: Coffee },
        { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
        { id: 'emergency', name: 'Emergency', icon: Hospital },
    ];

    const handleCategorySelect = async (categoryId: string) => {
        setCategory(categoryId);
        setIsLoading(true);

        try {
            const foundPlaces = await discoveryAgent.discoverNearby(categoryId as any);
            setPlaces(foundPlaces);

            const rec = await discoveryAgent.getLocalRecommendation(
                `Where should I go for ${categoryId} in Bangalore?`
            );
            setRecommendation(rec);
        } catch (error) {
            console.error('Discovery error:', error);
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
                        <h1 className="text-3xl font-bold text-white">Discover Bengaluru</h1>
                        <p className="text-gray-400">Find the best local spots</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = category === cat.id;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${isActive
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/15'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* AI Recommendation */}
                {recommendation && (
                    <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🧭</span>
                            <div>
                                <h4 className="font-semibold text-blue-200 mb-1">Local Tip</h4>
                                <p className="text-blue-100 text-sm">{recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Places List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Discovering places...</p>
                        </div>
                    ) : places.length > 0 ? (
                        places.map((place) => (
                            <PlaceCard key={place.id} place={place} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p>Select a category to discover places</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
