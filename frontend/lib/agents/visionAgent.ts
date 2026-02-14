/**
 * Vision Agent - Process camera images with Gemini Vision
 */
import { generateFromImage, MODELS } from '@/lib/gemini';

export interface VisionResult {
    text: string;
    translatedText?: string;
    context?: string;
}

export class VisionAgent {
    private modelName = MODELS.GEMINI_VISION;

    async analyzeImage(imageData: string, prompt?: string): Promise<VisionResult> {
        const defaultPrompt = `
You are a vision assistant helping someone navigate Bengaluru.
Analyze this image and:
1. Extract any visible text (OCR) - especially Kannada, English, or Hindi
2. Identify what the image shows (bus stop, restaurant, sign, etc.)
3. Provide helpful context about what you see
4. If there's Kannada text, translate it to English

Be concise and practical. Format your response as:
TEXT: [extracted text]
TRANSLATION: [if Kannada, translate to English]
CONTEXT: [what this is and why it matters]
    `.trim();

        try {
            const response = await generateFromImage(
                prompt || defaultPrompt,
                imageData,
                this.modelName
            );

            // Parse response
            const lines = response.split('\n');
            const result: VisionResult = { text: '' };

            for (const line of lines) {
                if (line.startsWith('TEXT:')) {
                    result.text = line.replace('TEXT:', '').trim();
                } else if (line.startsWith('TRANSLATION:')) {
                    result.translatedText = line.replace('TRANSLATION:', '').trim();
                } else if (line.startsWith('CONTEXT:')) {
                    result.context = line.replace('CONTEXT:', '').trim();
                }
            }

            // If parsing failed, return raw response
            if (!result.text && !result.context) {
                result.context = response;
            }

            return result;
        } catch (error) {
            console.error('Vision agent error:', error);
            throw new Error('Failed to analyze image');
        }
    }

    async translateSign(imageData: string): Promise<string> {
        const prompt = `
Translate any Kannada text in this image to English.
If there's no Kannada text, describe what you see.
Be brief and direct.
    `.trim();

        try {
            const response = await generateFromImage(prompt, imageData, this.modelName);
            return response;
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Failed to translate');
        }
    }

    async identifyFood(imageData: string): Promise<string> {
        const prompt = `
Identify any food items in this image.
If it's a menu or food stall:
- Name the dishes
- Suggest what's popular in Bengaluru
- Mention if it's vegetarian/non-vegetarian
Be helpful for someone new to Bangalore food culture.
    `.trim();

        try {
            const response = await generateFromImage(prompt, imageData, this.modelName);
            return response;
        } catch (error) {
            console.error('Food identification error:', error);
            throw new Error('Failed to identify food');
        }
    }
    async findPG(imageData: string): Promise<string> {
        const prompt = `
This might be a PG/hostel listing or rental board.
Extract key information:
- Price per month
- Contact number
- Amenities mentioned
- Location
- Any important details

Be concise and extract only factual information visible in the image.
    `.trim();

        try {
            const response = await generateFromImage(prompt, imageData, this.modelName);
            return response;
        } catch (error) {
            console.error('PG info extraction error:', error);
            throw new Error('Failed to extract PG information');
        }
    }
}

// Singleton export
export const visionAgent = new VisionAgent();
