/**
 * Audio Agent - Process voice with Gemini Audio
 */
import { generateFromAudio, generateText, MODELS } from '@/lib/gemini';

export interface AudioResult {
    transcript: string;
    response: string;
    translatedResponse?: string;
}

export class AudioAgent {
    private modelName = MODELS.GEMINI_AUDIO;

    async processVoiceCommand(audioData: string): Promise<AudioResult> {
        const prompt = `
You are a voice assistant for Namma Guide, helping someone navigate Bengaluru.

Listen to the audio and:
1. Transcribe what they said
2. Understand their intent (asking directions, prices, translation help, etc.)
3. Provide a helpful, conversational response

Be friendly and concise. Speak like a helpful local friend.
    `.trim();

        try {
            const response = await generateFromAudio(prompt, audioData, this.modelName);

            // For now, return the response as-is
            // In production, you'd parse transcript vs response
            return {
                transcript: 'Voice input received',
                response: response,
            };
        } catch (error) {
            console.error('Audio agent error:', error);
            throw new Error('Failed to process audio');
        }
    }

    async translateVoice(text: string, targetLanguage: string = 'Kannada'): Promise<string> {
        const prompt = `
Translate this to ${targetLanguage} (Bengaluru dialect with common slang):
"${text}"

Make it sound natural, like how a local would say it.
If it's a question about price or directions, include common negotiation phrases.
    `.trim();

        try {
            const translation = await generateText(prompt, MODELS.GEMINI_PRO);
            return translation;
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Failed to translate');
        }
    }

    async getNegotiationHelp(scenario: string): Promise<string> {
        const prompt = `
Help negotiate in Kannada for this scenario: ${scenario}

Provide:
1. What to say in Kannada (with English pronunciation)
2. Expected response
3. Counter-offer strategy

Be practical and use real Bangalore street language.
    `.trim();

        try {
            const help = await generateText(prompt, MODELS.GEMINI_PRO);
            return help;
        } catch (error) {
            console.error('Negotiation help error:', error);
            throw new Error('Failed to get negotiation help');
        }
    }

    /**
     * Speak text using Web Speech API (fallback)
     */
    speak(text: string, language: string = 'en-IN'): void {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.rate = 0.9;
            utterance.pitch = 1;

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported');
        }
    }

    /**
     * Stop speaking
     */
    stopSpeaking(): void {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}

// Singleton export
export const audioAgent = new AudioAgent();
