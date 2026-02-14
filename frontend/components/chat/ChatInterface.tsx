"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Send, X } from 'lucide-react';
import ChatMessage, { TypingIndicator } from '@/components/chat/ChatMessage';
import { assistantAgent, type Message } from '@/lib/agents/assistantAgent';
import VoiceRecorder from '@/components/media/VoiceRecorder';

interface ChatInterfaceProps {
    onToolResult?: (toolName: string, result: any) => void;
    onCameraRequest?: () => void;
}

export default function ChatInterface({ onToolResult, onCameraRequest }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showVoiceInput, setShowVoiceInput] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        setInput('');
        setIsProcessing(true);

        try {
            const result = await assistantAgent.processMessage(text);

            // Update messages from agent's history
            setMessages(assistantAgent.getHistory());

            // Trigger camera if needed
            if (result.shouldTriggerCamera) {
                onCameraRequest?.();
            }

            // Send tool result to parent for panel display
            if (result.toolCall) {
                onToolResult?.(result.toolCall.name, result.toolCall.result);
            }
        } catch (error) {
            console.error('Message processing error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(input);
        }
    };

    const handleVoiceComplete = (audioBlob: Blob, audioData: string) => {
        setShowVoiceInput(false);
        // For demo, simulate speech-to-text
        handleSendMessage("How do I get to MG Road?");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">🏙️</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Hi! I'm Namma Guide
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Ask me anything about Bengaluru - transport, food, places, or translations!
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <button
                                    onClick={() => handleSendMessage("How do I get to Koramangala?")}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-gray-300 transition-colors"
                                >
                                    🚌 Find transport
                                </button>
                                <button
                                    onClick={() => handleSendMessage("Where can I find good dosa?")}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-gray-300 transition-colors"
                                >
                                    🍽️ Find food
                                </button>
                                <button
                                    onClick={() => handleSendMessage("What does this sign say?")}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-gray-300 transition-colors"
                                >
                                    📸 Read text
                                </button>
                                <button
                                    onClick={() => handleSendMessage("Say that in Kannada")}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-gray-300 transition-colors"
                                >
                                    🗣️ Translate
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                isLatest={index === messages.length - 1}
                            />
                        ))}
                        {isProcessing && <TypingIndicator />}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4">
                <div className="flex items-end gap-2">
                    {/* Voice Button */}
                    {!showVoiceInput ? (
                        <button
                            onClick={() => setShowVoiceInput(true)}
                            className="flex-shrink-0 p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
                        >
                            <Mic className="w-5 h-5 text-white" />
                        </button>
                    ) : (
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setShowVoiceInput(false)}
                                className="p-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    )}

                    {showVoiceInput ? (
                        <div className="flex-1 flex justify-center">
                            <VoiceRecorder onRecordingComplete={handleVoiceComplete} />
                        </div>
                    ) : (
                        <>
                            {/* Text Input */}
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about Bengaluru..."
                                disabled={isProcessing}
                                rows={1}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-50"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />

                            {/* Send Button */}
                            <button
                                onClick={() => handleSendMessage(input)}
                                disabled={!input.trim() || isProcessing}
                                className="flex-shrink-0 p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
