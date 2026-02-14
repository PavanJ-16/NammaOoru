"use client";

import { X } from 'lucide-react';
import RouteDisplay from '@/components/transport/RouteDisplay';
import PlaceCard from '@/components/discovery/PlaceCard';
import { TransportRoute } from '@/lib/agents/transportAgent';
import { DiscoveryPlace } from '@/lib/agents/discoveryAgent';

interface ToolPanelProps {
    isOpen: boolean;
    onClose: () => void;
    toolName: string;
    toolResult: any;
}

export default function ToolPanel({ isOpen, onClose, toolName, toolResult }: ToolPanelProps) {
    if (!isOpen) return null;

    return (
        <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-slate-900 border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white capitalize">
                    {toolName === 'transport' && '🚌 Routes'}
                    {toolName === 'discovery' && '📍 Places'}
                    {toolName === 'translation' && '🗣️ Translation'}
                    {toolName === 'camera' && '📸 Vision'}
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto h-[calc(100%-73px)]">
                {toolName === 'transport' && toolResult?.routes && (
                    <div className="space-y-4">
                        {toolResult.recommendation && (
                            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-100">{toolResult.recommendation}</p>
                            </div>
                        )}
                        <RouteDisplay routes={toolResult.routes} />
                    </div>
                )}

                {toolName === 'discovery' && Array.isArray(toolResult) && (
                    <div className="space-y-3">
                        {toolResult.map((place: DiscoveryPlace) => (
                            <PlaceCard key={place.id} place={place} />
                        ))}
                    </div>
                )}

                {toolName === 'translation' && (
                    <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                        <p className="text-lg text-green-100">{toolResult}</p>
                    </div>
                )}

                {toolName === 'camera' && toolResult && (
                    <div className="space-y-4">
                        {toolResult.text && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Extracted Text</h4>
                                <p className="text-white">{toolResult.text}</p>
                            </div>
                        )}
                        {toolResult.translatedText && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Translation</h4>
                                <p className="text-white">{toolResult.translatedText}</p>
                            </div>
                        )}
                        {toolResult.context && (
                            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-100">{toolResult.context}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
