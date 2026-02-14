"use client";

import { useState, useRef } from 'react';
import { Camera, XCircle } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (imageData: string) => void;
    onClose?: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturing, setCapturing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 1280, height: 720 }
            });

            setStream(mediaStream);
            setCapturing(true);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please grant permission.');
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.9);

                stopCamera();
                onCapture(imageData);
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCapturing(false);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose?.();
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <XCircle className="w-6 h-6 text-white" />
                </button>

                {!capturing ? (
                    /* Start camera button */
                    <button
                        onClick={startCamera}
                        className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
                    >
                        <Camera className="w-16 h-16 text-white" />
                        <span className="text-xl font-semibold text-white">Open Camera</span>
                    </button>
                ) : (
                    /* Camera view */
                    <div className="relative w-full max-w-2xl">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full rounded-lg"
                        />

                        {/* Capture button */}
                        <div className="flex justify-center mt-6 gap-4">
                            <button
                                onClick={captureImage}
                                className="px-8 py-4 rounded-full bg-white text-purple-900 font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
                            >
                                📸 Capture Photo
                            </button>
                            <button
                                onClick={stopCamera}
                                className="px-6 py-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}
