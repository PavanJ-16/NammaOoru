"use client";

import { Message } from '@/lib/agents/assistantAgent';
import { User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

export default function ChatMessage({ message, isLatest }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-purple-600' : 'bg-gray-700'
                }`}>
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl ${isUser
                        ? 'bg-purple-600 text-white rounded-tr-sm'
                        : 'bg-white/10 text-gray-100 rounded-tl-sm'
                    }`}>
                    <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                        {message.content}
                    </div>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>

                {/* Tool indicator */}
                {message.toolUsed && (
                    <div className="text-xs text-gray-400 mt-1 px-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Used {message.toolUsed} tool
                    </div>
                )}
            </div>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-tl-sm">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
