/**
 * Gemini Client Library with Chat Session Support
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('Gemini API key not found');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const MODELS = {
    GEMINI_PRO: 'gemini-2.0-flash-exp',
    GEMINI_FLASH: 'gemini-2.0-flash-exp',
    GEMINI_VISION: 'gemini-2.0-flash-exp',
};

/**
 * Generate text response from Gemini
 */
export async function generateText(
    prompt: string,
    modelName: string = MODELS.GEMINI_PRO
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini text generation error:', error);
        throw error;
    }
}

/**
 * Start a chat session
 */
export function startChat(modelName: string = MODELS.GEMINI_PRO) {
    const model = genAI.getGenerativeModel({ model: modelName });
    return model.startChat({
        history: [],
    });
}

/**
 * Generate content from image
 */
export async function generateFromImage(
    prompt: string,
    imageData: string,
    modelName: string = MODELS.GEMINI_VISION
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Remove data URL prefix if present
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini vision error:', error);
        throw error;
    }
}

/**
 * Generate content from audio (placeholder for future)
 */
export async function generateFromAudio(
    audioData: string,
    modelName: string = MODELS.GEMINI_PRO
): Promise<string> {
    // Placeholder - audio support may vary
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(
            'Transcribe this audio: [audio data]'
        );
        return result.response.text();
    } catch (error) {
        console.error('Gemini audio error:', error);
        throw error;
    }
}

/**
 * Stream text generation (for real-time responses)
 */
export async function* streamText(
    prompt: string,
    modelName: string = MODELS.GEMINI_PRO
): AsyncGenerator<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            yield text;
        }
    } catch (error) {
        console.error('Gemini streaming error:', error);
        throw error;
    }
}
