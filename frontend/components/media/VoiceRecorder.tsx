"use client";

import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob, audioData: string) => void;
    onTranscript?: (text: string) => void;
}

export default function VoiceRecorder({ onRecordingComplete, onTranscript }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Convert to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    const audioData = base64data.replace(/^data:audio\/webm;base64,/, '');
                    onRecordingComplete(audioBlob, audioData);
                };
                reader.readAsDataURL(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please grant permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${isRecording
                        ? 'bg-red-600 animate-pulse'
                        : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isProcessing ? (
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : isRecording ? (
                    <MicOff className="w-12 h-12 text-white" />
                ) : (
                    <Mic className="w-12 h-12 text-white" />
                )}

                {/* Pulse effect when recording */}
                {isRecording && (
                    <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></span>
                )}
            </button>

            <p className="text-sm text-gray-400">
                {isProcessing
                    ? 'Processing...'
                    : isRecording
                        ? 'Recording... Tap to stop'
                        : 'Tap to record'}
            </p>
        </div>
    );
}
