'use client';

import React, { useState, useEffect } from 'react';
import { signatureStorage, StoredSignature } from '@/lib/signature-storage';
import { X, Trash2 } from 'lucide-react';

interface SignatureHistoryProps {
    onSelect: (dataUrl: string) => void;
}

export function SignatureHistory({ onSelect }: SignatureHistoryProps) {
    const [signatures, setSignatures] = useState<StoredSignature[]>([]);

    useEffect(() => {
        loadSignatures();
    }, []);

    const loadSignatures = () => {
        const stored = signatureStorage.getSignatures();
        // Show most recent first
        setSignatures(stored.reverse());
    };

    const handleDelete = (id: string) => {
        signatureStorage.deleteSignature(id);
        loadSignatures();
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all saved signatures?')) {
            signatureStorage.clearSignatures();
            setSignatures([]);
        }
    };

    if (signatures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-lg mb-2">No saved signatures</p>
                <p className="text-sm">Signatures you create will be saved here for reuse</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    {signatures.length} saved signature{signatures.length !== 1 ? 's' : ''}
                </p>
                <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                    <Trash2 size={14} />
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {signatures.map((sig) => (
                    <div
                        key={sig.id}
                        className="relative group border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all bg-white"
                        onClick={() => onSelect(sig.dataUrl)}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(sig.id);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <X size={12} />
                        </button>
                        <div className="flex items-center justify-center h-20">
                            <img
                                src={sig.dataUrl}
                                alt="Saved signature"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            {new Date(sig.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
