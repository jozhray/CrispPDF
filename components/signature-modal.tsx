'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Eraser, History } from 'lucide-react';
import { SignatureHistory } from './signature-history';
import { signatureStorage } from '@/lib/signature-storage';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureDataUrl: string) => void;
}

export function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
    const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'history'>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'draw') {
            // Reset canvas on open
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = 'black';
                }
            }
        }
    }, [isOpen, activeTab]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        let signatureDataUrl = '';

        if (activeTab === 'draw') {
            const canvas = canvasRef.current;
            if (canvas) {
                signatureDataUrl = canvas.toDataURL('image/png');
            }
        } else if (activeTab === 'type') {
            // Convert typed text to image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = 400;
                canvas.height = 100;
                ctx.font = '48px "Dancing Script", cursive';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
                signatureDataUrl = canvas.toDataURL('image/png');
            }
        }

        if (signatureDataUrl) {
            // Save to localStorage
            signatureStorage.saveSignature(signatureDataUrl);
            onSave(signatureDataUrl);
        }

        onClose();
    };

    const handleHistorySelect = (dataUrl: string) => {
        onSave(dataUrl);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-800">Add Signature</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'draw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('draw')}
                    >
                        Draw
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'type' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('type')}
                    >
                        Type
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex items-center justify-center gap-1`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={16} />
                        History
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'draw' ? (
                        <div className="relative border rounded-lg bg-gray-50 h-48 touch-none">
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={192} // h-48 * 4
                                className="w-full h-full cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            <button
                                onClick={clearCanvas}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white rounded shadow-sm"
                                title="Clear"
                            >
                                <Eraser size={16} />
                            </button>
                        </div>
                    ) : activeTab === 'type' ? (
                        <div className="flex flex-col gap-4 h-48 justify-center">
                            <input
                                type="text"
                                value={typedSignature}
                                onChange={(e) => setTypedSignature(e.target.value)}
                                placeholder="Type your name"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="h-20 flex items-center justify-center border rounded bg-gray-50 overflow-hidden">
                                <span className="text-4xl font-[family-name:var(--font-dancing-script)]">
                                    {typedSignature || 'Signature'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <SignatureHistory onSelect={handleHistorySelect} />
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    {activeTab !== 'history' && (
                        <button
                            onClick={handleSave}
                            disabled={activeTab === 'type' && !typedSignature}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Check size={16} />
                            Insert Signature
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
