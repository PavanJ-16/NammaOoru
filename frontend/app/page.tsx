"use client";

import Link from 'next/link';
import { Mic, MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏙️</div>
          <div>
            <h1 className="text-xl font-bold text-white">Namma Guide</h1>
            <p className="text-sm text-gray-400">Your Bengaluru AI Companion</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-5xl font-bold text-white mb-4"> 
            Welcome to Namma Guide
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Your intelligent AI companion for navigating Bengaluru
          </p>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
            {/* Voice Mode */}
            <Link
              href="/voice"
              className="group relative p-8 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all transform hover:scale-105"
            >
              <div className="mb-4 w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Voice Mode</h3>
              <p className="text-gray-400 text-sm mb-4">
                Hands-free voice assistant with natural conversation
              </p>
              <div className="text-purple-400 font-semibold text-sm">
                Recommended →
              </div>
            </Link>

            {/* Chat Mode */}
            <Link
              href="/chat"
              className="group relative p-8 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all transform hover:scale-105"
            >
              <div className="mb-4 w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Chat Mode</h3>
              <p className="text-gray-400 text-sm mb-4">
                Text-based conversation with AI assistant
              </p>
              <div className="text-blue-400 font-semibold text-sm">
                Alternative →
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl mb-1">🚌</div>
              <div className="text-gray-300">Transport</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl mb-1">🍽️</div>
              <div className="text-gray-300">Discovery</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl mb-1">🗣️</div>
              <div className="text-gray-300">Translation</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl mb-1">📸</div>
              <div className="text-gray-300">OCR</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
