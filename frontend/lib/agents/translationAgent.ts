/**
 * Translation Agent - Real-time translation with cultural context
 */
import { generateText, MODELS } from '@/lib/gemini';

export class TranslationAgent {
    private modelName = MODELS.GEMINI_PRO;

    async translateToBangaloreKannada(text: string): Promise<string> {
        const prompt = `
Translate to Bangalore Kannada (NOT formal Kannada):
"${text}"

Use:
- Common Bangalore slang and mixed language (Kanglish)
- Familiar "neevu" instead of formal "nivu"
- Street language people actually use
- Include English words where locals normally mix them

Example: "How much?" → "Yaake? Eshtu aagutte?" or "Eshtu sir?"

Give ONLY the translation, no explanation.
    `.trim();

        try {
            const translation = await generateText(prompt, this.modelName);
            return translation.trim();
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Failed to translate');
        }
    }

    async translateToEnglish(kannadaText: string): Promise<string> {
        const prompt = `
Translate this Kannada text to English:
"${kannadaText}"

Give ONLY the translation, no explanation.
    `.trim();

        try {
            const translation = await generateText(prompt, this.modelName);
            return translation.trim();
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Failed to translate');
        }
    }

    async getAutoNegotiationScript(): Promise<{ kannada: string; pronunciation: string; meaning: string }[]> {
        const prompt = `
Provide 5 common phrases for negotiating with Bangalore auto drivers.
For each phrase, give:
1. Kannada text
2. English pronunciation
3. English meaning

Format as JSON array:
[{"kannada": "...", "pronunciation": "...", "meaning": "..."}]
    `.trim();

        try {
            const response = await generateText(prompt, this.modelName);
            // Try to parse JSON, fallback to default if fails
            try {
                return JSON.parse(response);
            } catch {
                return [
                    {
                        kannada: "ಮೀಟರ್ ಹಾಕಿ",
                        pronunciation: "Meter haaki",
                        meaning: "Put the meter on"
                    },
                    {
                        kannada: "ಫಿಕ್ಸೆಡ್ ಯಾಕೆ?",
                        pronunciation: "Fixed yaake?",
                        meaning: "Why fixed price?"
                    },
                    {
                        kannada: "ತುಂಬಾ ಜಾಸ್ತಿ",
                        pronunciation: "Thumba jaasti",
                        meaning: "Too much"
                    },
                    {
                        kannada: "ಇನ್ನೊಂದು ಎಷ್ಟು?",
                        pronunciation: "Innond maadi",
                        meaning: "Make it less"
                    },
                    {
                        kannada: "ಸರಿ, ಹೋಗೋಣ",
                        pronunciation: "Sari, hogona",
                        meaning: "Okay, let's go"
                    }
                ];
            }
        } catch (error) {
            console.error('Negotiation script error:', error);
            throw new Error('Failed to get negotiation script');
        }
    }

    async getCulturalContext(phrase: string): Promise<string> {
        const prompt = `
Explain the cultural context of this Bangalore phrase:
"${phrase}"

Include:
- When to use it
- Appropriate situations
- Any cultural nuances
- Polite vs casual usage

Be brief (2-3 sentences).
    `.trim();

        try {
            const context = await generateText(prompt, this.modelName);
            return context;
        } catch (error) {
            console.error('Cultural context error:', error);
            throw new Error('Failed to get cultural context');
        }
    }
}

// Singleton export
export const translationAgent = new TranslationAgent();
