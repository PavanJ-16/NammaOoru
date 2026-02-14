/**
 * Master AI Assistant with Tool Calling
 * Inspired by Claude/ChatGPT - understands intent and uses tools intelligently
 */
import { generateText, startChat, MODELS } from '@/lib/gemini';
import { visionAgent } from './visionAgent';
import { transportAgent } from './transportAgent';
import { discoveryAgent } from './discoveryAgent';
import { translationAgent } from './translationAgent';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolUsed?: string;
    toolResult?: any;
}

export interface ToolCall {
    name: string;
    parameters: any;
    result?: any;
}

export class AssistantAgent {
    private conversationHistory: Message[] = [];
    private chatSession: any;

    constructor() {
        this.initializeChat();
    }

    private initializeChat() {
        this.chatSession = startChat(MODELS.GEMINI_PRO);
    }

    /**
     * Process user message and decide which tool to use
     */
    async processMessage(userMessage: string): Promise<{
        response: string;
        toolCall?: ToolCall;
        shouldTriggerCamera?: boolean;
        shouldTriggerMic?: boolean;
    }> {
        // Add user message to history
        this.conversationHistory.push({
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        });

        // Analyze intent and decide action
        const intent = await this.analyzeIntent(userMessage);

        let response = '';
        let toolCall: ToolCall | undefined;
        let shouldTriggerCamera = false;
        let shouldTriggerMic = false;

        // Execute appropriate tool based on intent
        switch (intent.type) {
            case 'transport':
                toolCall = await this.handleTransport(intent);
                response = this.formatTransportResponse(toolCall.result);
                break;

            case 'discovery':
                toolCall = await this.handleDiscovery(intent);
                response = this.formatDiscoveryResponse(toolCall.result);
                break;

            case 'camera_needed':
                shouldTriggerCamera = true;
                response = "I'll help you read that. Opening camera...";
                break;

            case 'translation':
                toolCall = await this.handleTranslation(intent);
                response = toolCall.result;
                break;

            case 'conversation':
            default:
                response = await this.handleConversation(userMessage);
                break;
        }

        // Add assistant response to history
        this.conversationHistory.push({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            toolUsed: toolCall?.name,
            toolResult: toolCall?.result,
        });

        return {
            response,
            toolCall,
            shouldTriggerCamera,
            shouldTriggerMic,
        };
    }

    /**
     * Analyze user intent using Gemini
     */
    private async analyzeIntent(message: string): Promise<any> {
        const prompt = `
Analyze this user message and determine their intent:
"${message}"

Choose ONE intent:
- "transport" - if asking about buses, metro, autos, routes, directions, how to get somewhere
- "discovery" - if asking about food, cafes, places, restaurants, shopping, PG/hostels
- "camera_needed" - if asking to read/translate text, signs, menus, boards (phrases like "what does this say", "read this", "translate this sign")
- "translation" - if asking to translate specific text they provide
- "conversation" - for greetings, general questions about Bangalore

Respond with ONLY the intent name (one word).
    `.trim();

        try {
            const intent = await generateText(prompt, MODELS.GEMINI_FLASH);
            const intentType = intent.toLowerCase().trim();

            // Extract parameters based on intent
            let parameters = {};

            if (intentType.includes('transport')) {
                parameters = await this.extractTransportParams(message);
            } else if (intentType.includes('discovery')) {
                parameters = await this.extractDiscoveryParams(message);
            }

            return {
                type: intentType.includes('transport') ? 'transport' :
                    intentType.includes('discovery') ? 'discovery' :
                        intentType.includes('camera') ? 'camera_needed' :
                            intentType.includes('translation') ? 'translation' :
                                'conversation',
                parameters,
            };
        } catch (error) {
            console.error('Intent analysis error:', error);
            return { type: 'conversation', parameters: {} };
        }
    }

    private async extractTransportParams(message: string): Promise<any> {
        const prompt = `
Extract origin and destination from: "${message}"

Respond in JSON format:
{"origin": "...", "destination": "..."}

If origin is missing, set it to null.
    `.trim();

        try {
            const response = await generateText(prompt, MODELS.GEMINI_FLASH);
            const match = response.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
        } catch (error) {
            console.error('Param extraction error:', error);
        }

        return {};
    }

    private async extractDiscoveryParams(message: string): Promise<any> {
        const prompt = `
What category of place are they looking for: "${message}"

Choose: "food", "cafe", "shopping", "emergency", or "pg"
Respond with just the category word.
    `.trim();

        try {
            const category = await generateText(prompt, MODELS.GEMINI_FLASH);
            return { category: category.toLowerCase().trim() };
        } catch (error) {
            return { category: 'food' };
        }
    }

    private async handleTransport(intent: any): Promise<ToolCall> {
        const { origin, destination } = intent.parameters;

        if (!destination) {
            return {
                name: 'transport',
                parameters: intent.parameters,
                result: { needsMoreInfo: true, question: "Where do you want to go?" }
            };
        }

        if (!origin) {
            return {
                name: 'transport',
                parameters: intent.parameters,
                result: { needsMoreInfo: true, question: "From where are you starting?" }
            };
        }

        const routes = await transportAgent.searchRoutes(origin, destination);
        const recommendation = await transportAgent.getRecommendation(origin, destination);

        return {
            name: 'transport',
            parameters: { origin, destination },
            result: { routes, recommendation }
        };
    }

    private async handleDiscovery(intent: any): Promise<ToolCall> {
        const { category } = intent.parameters;
        const places = await discoveryAgent.discoverNearby(category || 'food');

        return {
            name: 'discovery',
            parameters: { category },
            result: places
        };
    }

    private async handleTranslation(intent: any): Promise<ToolCall> {
        // For demo - in real app would extract text from message
        const translation = await translationAgent.translateToBangaloreKannada(
            "How much does this cost?"
        );

        return {
            name: 'translation',
            parameters: {},
            result: translation
        };
    }

    private async handleConversation(message: string): Promise<string> {
        const prompt = `
You are Namma Guide, a friendly AI assistant helping people navigate Bengaluru.

User: ${message}

Respond naturally and helpfully. If they're greeting you, greet back. If asking about Bangalore, share local knowledge.
Keep it brief (2-3 sentences max).
    `.trim();

        try {
            const response = await generateText(prompt, MODELS.GEMINI_PRO);
            return response;
        } catch (error) {
            return "Hi! I'm Namma Guide. Ask me about transport, food, or anything about Bengaluru!";
        }
    }

    private formatTransportResponse(result: any): string {
        if (result.needsMoreInfo) {
            return result.question;
        }

        const { routes, recommendation } = result;
        return `${recommendation}\n\nI found ${routes.length} options - check the panel for details!`;
    }

    private formatDiscoveryResponse(places: any[]): string {
        if (places.length === 0) {
            return "I couldn't find any places nearby. Try a different category?";
        }

        return `Found ${places.length} great spots! Check the panel to see details.`;
    }

    getHistory(): Message[] {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
        this.initializeChat();
    }
}

// Singleton
export const assistantAgent = new AssistantAgent();
