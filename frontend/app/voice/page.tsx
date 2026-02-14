"use client";

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Bus, UtensilsCrossed, Languages } from 'lucide-react';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function GeminiLiveVoice() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click to start');
  const [messages, setMessages] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const playAudioChunk = async (audioData: ArrayBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    try {
      // Gemini returns raw PCM16 audio at 24kHz mono
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        if (audioQueueRef.current.length > 0) {
          const next = audioQueueRef.current.shift();
          if (next) playAudioChunk(next);
        } else {
          isPlayingRef.current = false;
          setIsSpeaking(false);
        }
      };

      source.start();
      setIsSpeaking(true);
    } catch (error) {
      console.error('Audio playback error:', error);
      isPlayingRef.current = false;
      setIsSpeaking(false);
    }
  };

  const startStreaming = async () => {
    try {
      setStatusMessage('Connecting to Gemini...');
      console.log('🔌 Connecting to Gemini Live API...');

      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`
      );

      ws.onopen = () => {
        console.log('🟢 WebSocket connected');
        setIsConnected(true);
        setStatusMessage('Setting up...');

        const setupMessage = {
          setup: {
            model: 'models/gemini-2.5-flash-native-audio-preview-12-2025',
            generationConfig: {
              responseModalities: 'audio'
            },
            systemInstruction: {
              parts: [{
                text: `You are Namma Guide, a friendly AI assistant for Bengaluru. 

CORE CAPABILITIES:
- Transport: Help with metro routes, bus info, cab estimates, traffic updates
- Discovery: Recommend restaurants, cafes, parks, shopping, attractions  
- Translation: Understand and respond in Kannada, English, or mix

PERSONALITY:
- Brief and conversational for voice
- Use local Kannada terms naturally (anna, akka, swalpa, etc)
- Friendly and helpful like a Bengaluru local

Keep responses short and to the point for voice interaction.`
              }]
            }
          }
        };

        console.log('📤 Sending setup');
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          let response;

          if (event.data instanceof Blob) {
            const text = await event.data.text();
            response = JSON.parse(text);
          } else {
            response = JSON.parse(event.data);
          }

          console.log('📥 Received:', response);

          if (response.setupComplete) {
            console.log('✅ Setup complete! Starting microphone...');
            setStatusMessage('Ready! Speak now...');
            startMicrophone();
            return;
          }

          if (response.serverContent) {
            const parts = response.serverContent.modelTurn?.parts || [];

            for (const part of parts) {
              if (part.inlineData?.mimeType?.includes('audio')) {
                const audioData = base64ToArrayBuffer(part.inlineData.data);

                if (isPlayingRef.current) {
                  audioQueueRef.current.push(audioData);
                } else {
                  isPlayingRef.current = true;
                  playAudioChunk(audioData);
                }
              }

              if (part.text) {
                console.log('💬 AI:', part.text);
                setMessages(prev => [...prev, `AI: ${part.text}`]);
              }
            }
          }

          if (response.error) {
            console.error('❌ Server error:', response.error);
            setStatusMessage(`Error: ${response.error.message || 'Unknown'}`);
            setMessages(prev => [...prev, `Error: ${response.error.message}`]);
          }
        } catch (error) {
          console.error('Failed to parse:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setStatusMessage('Connection error - check API key');
        setMessages(prev => [...prev, 'WebSocket error - check console']);
      };

      ws.onclose = (event) => {
        console.log('🔴 Closed:', event.code, event.reason);
        setIsConnected(false);
        setStatusMessage(`Disconnected (${event.code})`);
        if (event.reason) {
          setMessages(prev => [...prev, `Reason: ${event.reason}`]);
        }
        stopStreaming();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Connection failed:', error);
      setStatusMessage('Failed to connect');
      setMessages(prev => [...prev, `Error: ${error}`]);
    }
  };

  const startMicrophone = async () => {
    try {
      console.log('🎤 Requesting microphone...');

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);

      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          const base64Audio = arrayBufferToBase64(pcmData.buffer);

          const message = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio,
              }]
            }
          };

          wsRef.current.send(JSON.stringify(message));
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsRecording(true);
      console.log('✅ Microphone started with PCM encoding');
    } catch (error) {
      console.error('❌ Mic error:', error);
      setStatusMessage('Microphone denied');
      setMessages(prev => [...prev, 'Please allow microphone access']);
    }
  };

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsConnected(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const toggleConnection = () => {
    if (isConnected) {
      stopStreaming();
      setStatusMessage('Click to start');
    } else {
      setMessages([]);
      startStreaming();
    }
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  useEffect(() => {
    return () => stopStreaming();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/" className="text-3xl hover:opacity-80">🏙️</a>
            <div>
              <h1 className="text-xl font-bold text-white">Namma Guide Voice</h1>
              <p className="text-sm text-gray-400">AI assistant for Bengaluru</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${isConnected
                  ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                  : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">{statusMessage}</h2>

            <div className="flex items-center justify-center gap-6">
              {isRecording && (
                <div className="flex items-center gap-3 animate-pulse">
                  <Mic className="w-5 h-5 text-red-500" />
                  <span className="text-red-400 font-medium">Listening</span>
                  <div className="flex gap-1 items-end">
                    <div className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                    <div className="w-1 h-5 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.1s_infinite]" />
                    <div className="w-1 h-4 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.2s_infinite]" />
                    <div className="w-1 h-6 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" />
                    <div className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-3 animate-pulse">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-400 font-medium">Speaking</span>
                  <div className="flex gap-1 items-end">
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" />
                    <div className="w-1 h-6 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.1s_infinite]" />
                    <div className="w-1 h-5 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.2s_infinite]" />
                    <div className="w-1 h-7 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.3s_infinite]" />
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {isRecording && (
                <>
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-red-500/10 animate-pulse" />
                </>
              )}
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '1s' }} />
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-blue-500/10 animate-pulse" />
                </>
              )}

              <button
                onClick={toggleConnection}
                className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl ${isConnected
                    ? 'bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                  }`}
              >
                {isConnected ? (
                  <MicOff className="w-20 h-20 text-white" />
                ) : (
                  <Mic className="w-20 h-20 text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              ✨ Features Available
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Bus className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Transport</div>
                  <div className="text-gray-400 text-xs">Metro routes, bus info, cab estimates, traffic</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <UtensilsCrossed className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Discovery</div>
                  <div className="text-gray-400 text-xs">Restaurants, cafes, parks, shopping, attractions</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Languages className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Multi-language</div>
                  <div className="text-gray-400 text-xs">Speak in Kannada, English, or mix both!</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400">
                <strong>Try:</strong> "Rajajinagar to MG Road metro" • "Best dosa near Indiranagar" • "Kannadadalli helu"
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto">
              <h4 className="text-white font-semibold mb-2 text-sm">Conversation:</h4>
              <div className="space-y-1 text-xs font-mono">
                {messages.map((msg, idx) => (
                  <div key={idx} className={msg.startsWith('AI:') ? 'text-blue-300' : 'text-gray-400'}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
