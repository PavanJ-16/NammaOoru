/**
 * Transport Agent - Route planning with Mappls and GTFS
 */
import { generateText, MODELS } from '@/lib/gemini';

// Mock API calls for now - will connect to backend later
export interface TransportRoute {
    type: 'bus' | 'metro' | 'auto' | 'walk';
    routeId?: string;
    routeName?: string;
    lineName?: string;
    operator: string;
    fromStop: string;
    toStop: string;
    duration: number; // minutes
    fare: number;
    stopsCount?: number;
    nextArrival?: number;
    crowding?: 'low' | 'medium' | 'high';
    ac?: boolean;
    distance?: number; // km
}

export class TransportAgent {
    private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    async searchRoutes(origin: string, destination: string): Promise<TransportRoute[]> {
        // For MVP, return mock data
        // In production, call backend API that uses Mappls + GTFS

        const mockRoutes: TransportRoute[] = [
            {
                type: 'metro',
                lineName: 'Purple Line',
                operator: 'Namma Metro (BMRCL)',
                fromStop: `${origin} Metro`,
                toStop: `${destination} Metro`,
                duration: 25,
                fare: 30,
                stopsCount: 5,
                nextArrival: 3,
                crowding: 'medium',
            },
            {
                type: 'bus',
                routeId: '500K',
                routeName: 'Kengeri - Shivajinagar',
                operator: 'BMTC',
                fromStop: `${origin} Bus Stop`,
                toStop: `${destination}`,
                duration: 40,
                fare: 20,
                stopsCount: 15,
                nextArrival: 5,
                crowding: 'high',
                ac: false,
            },
            {
                type: 'bus',
                routeId: 'Vayu Vajra',
                routeName: 'Airport Express',
                operator: 'BMTC',
                fromStop: origin,
                toStop: destination,
                duration: 35,
                fare: 150,
                stopsCount: 8,
                nextArrival: 12,
                crowding: 'low',
                ac: true,
            },
            {
                type: 'auto',
                operator: 'Auto Rickshaw',
                fromStop: origin,
                toStop: destination,
                duration: 20,
                fare: 120,
                distance: 8,
            },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return mockRoutes;
    }

    async getRecommendation(origin: string, destination: string): Promise<string> {
        const prompt = `
As a Bangalore local transport expert, recommend the best way to travel from ${origin} to ${destination}.

Consider:
- Time of day (assume it's during rush hour)
- Cost effectiveness
- Comfort
- Typical Bangalore traffic

Give a brief, practical recommendation (2-3 sentences).
    `.trim();

        try {
            const recommendation = await generateText(prompt, MODELS.GEMINI_PRO);
            return recommendation;
        } catch (error) {
            console.error('Recommendation error:', error);
            return 'Metro is usually fastest during rush hour. Auto is more convenient but expensive. BMTC buses are most economical.';
        }
    }

    async getAutoNegotiationTips(from: string, to: string, quotedPrice: number): Promise<string> {
        const prompt = `
An auto driver quoted ₹${quotedPrice} for ${from} to ${to} in Bangalore.

Provide:
1. Is this fair? (typical range is ₹15-20 per km)
2. What should I counter-offer?
3. Key Kannada phrase to negotiate

Be brief and practical.
    `.trim();

        try {
            const tips = await generateText(prompt, MODELS.GEMINI_PRO);
            return tips;
        } catch (error) {
            console.error('Negotiation tips error:', error);
            return `Meter rate should be around ₹${Math.floor(quotedPrice * 0.7)}. Say: "Meter haaki sir" (Put the meter on)`;
        }
    }

    async findNearbyStops(lat: number, lng: number): Promise<any[]> {
        // Mock nearby stops
        return [
            {
                name: 'Koramangala 5th Block Bus Stop',
                type: 'bus',
                distance: 200,
                routes: ['500K', '335E', 'G4'],
            },
            {
                name: 'Trinity Metro Station',
                type: 'metro',
                distance: 800,
                line: 'Purple Line',
            },
        ];
    }
}

// Singleton export
export const transportAgent = new TransportAgent();
