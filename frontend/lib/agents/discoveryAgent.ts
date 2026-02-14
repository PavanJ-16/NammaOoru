/**
 * Discovery Agent - Find food, places, and local experiences
 */
import { generateText, MODELS } from '@/lib/gemini';

export interface DiscoveryPlace {
    id: string;
    name: string;
    category: string;
    address: string;
    rating?: number;
    priceRange?: string;
    tags?: string[];
    distance?: number;
    imageUrl?: string;
    description?: string;
}

export class DiscoveryAgent {
    private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    async discoverNearby(
        category: 'food' | 'cafe' | 'shopping' | 'emergency' | 'pg',
        location?: string
    ): Promise<DiscoveryPlace[]> {
        // Mock data for MVP
        const mockPlaces: Record<string, DiscoveryPlace[]> = {
            food: [
                {
                    id: '1',
                    name: 'MTR',
                    category: 'South Indian Restaurant',
                    address: 'Lalbagh Road, Bangalore',
                    rating: 4.5,
                    priceRange: '₹₹',
                    tags: ['Breakfast', 'Dosa', 'Iconic'],
                    distance: 2.5,
                    description: 'Famous for authentic South Indian breakfast since 1924',
                },
                {
                    id: '2',
                    name: 'Vidyarthi Bhavan',
                    category: 'Breakfast Joint',
                    address: 'Gandhi Bazaar, Basavanagudi',
                    rating: 4.6,
                    priceRange: '₹',
                    tags: ['Dosa', 'Vegetarian', 'Local Favorite'],
                    distance: 3.2,
                    description: 'Legendary crispy dosas loved by locals',
                },
                {
                    id: '3',
                    name: 'The Rameshwaram Cafe',
                    category: 'South Indian',
                    address: 'Indiranagar',
                    rating: 4.4,
                    priceRange: '₹₹',
                    tags: ['Filter Coffee', 'Idli', 'Modern'],
                    distance: 1.8,
                    description: 'Popular chain with quality South Indian food',
                },
            ],
            cafe: [
                {
                    id: '4',
                    name: 'Third Wave Coffee',
                    category: 'Specialty Coffee',
                    address: 'Koramangala',
                    rating: 4.5,
                    priceRange: '₹₹₹',
                    tags: ['Coffee', 'Work-friendly', 'WiFi'],
                    distance: 0.8,
                    description: 'Premium coffee roasters with great ambiance',
                },
                {
                    id: '5',
                    name: 'Cafe Coffee Day',
                    category: 'Cafe Chain',
                    address: 'MG Road',
                    rating: 4.0,
                    priceRange: '₹₹',
                    tags: ['Coffee', 'Snacks', 'AC'],
                    distance: 2.1,
                    description: 'Reliable chain cafe for casual meetings',
                },
            ],
            shopping: [
                {
                    id: '6',
                    name: 'Commercial Street',
                    category: 'Shopping Street',
                    address: 'Shivajinagar, Bangalore',
                    rating: 4.3,
                    priceRange: '₹-₹₹',
                    tags: ['Clothes', 'Accessories', 'Street Shopping'],
                    distance: 4.5,
                    description: 'Bustling shopping street with bargain deals',
                },
            ],
            emergency: [
                {
                    id: '7',
                    name: 'Victoria Hospital',
                    category: 'Government Hospital',
                    address: 'Fort, Bangalore',
                    rating: 3.8,
                    priceRange: '₹',
                    tags: ['Emergency', '24/7', 'Trauma Care'],
                    distance: 3.5,
                    description: 'Major government hospital with emergency services',
                },
            ],
            pg: [
                {
                    id: '8',
                    name: 'Zolo Stays Premium PG',
                    category: 'Co-living',
                    address: 'HSR Layout',
                    priceRange: '₹₹₹',
                    tags: ['WiFi', 'Food', 'AC', 'Security'],
                    distance: 2.0,
                    description: 'Modern PG with all amenities - ₹12,000/month',
                },
            ],
        };

        await new Promise(resolve => setTimeout(resolve, 800));
        return mockPlaces[category] || [];
    }

    async getLocalRecommendation(query: string): Promise<string> {
        const prompt = `
As a Bangalore local, answer this question:
"${query}"

Be brief (2-3 sentences), practical, and mention specific neighborhoods or places in Bangalore.
Include insider tips that only locals would know.
    `.trim();

        try {
            const response = await generateText(prompt, MODELS.GEMINI_PRO);
            return response;
        } catch (error) {
            console.error('Recommendation error:', error);
            return 'Check out Koramangala for food, Indiranagar for cafes, and Commercial Street for shopping.';
        }
    }

    async translateMenu(menuText: string): Promise<string> {
        const prompt = `
Translate this Kannada menu item to English and explain what it is:
"${menuText}"

Format: [Dish Name] - [Brief description]
    `.trim();

        try {
            const translation = await generateText(prompt, MODELS.GEMINI_PRO);
            return translation;
        } catch (error) {
            console.error('Menu translation error:', error);
            throw new Error('Failed to translate menu');
        }
    }

    async getPGAdvice(budget: number, area: string): Promise<string> {
        const prompt = `
Advise on finding a PG/hostel in ${area}, Bangalore with budget ₹${budget}/month.

Include:
- Typical price range in this area
- What to check before booking
- Red flags to avoid
- Negotiation tips

Be brief and practical (3-4 points).
    `.trim();

        try {
            const advice = await generateText(prompt, MODELS.GEMINI_PRO);
            return advice;
        } catch (error) {
            console.error('PG advice error:', error);
            return 'Check room ventilation, water supply, and food quality. Negotiate if staying 6+ months. Avoid advance >2 months.';
        }
    }
}

// Singleton export
export const discoveryAgent = new DiscoveryAgent();
