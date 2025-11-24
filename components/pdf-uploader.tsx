'use client';

import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface PDFUploaderProps {
    onFileSelect: (file: File) => void;
}

export function PDFUploader({ onFileSelect }: PDFUploaderProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type === 'application/pdf') {
                    console.log('PDFUploader: file dropped', file.name);
                    onFileSelect(file);
                } else {
                    alert('Please upload a valid PDF file.');
                }
            }
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type === 'application/pdf') {
                    console.log('PDFUploader: file selected via input', file.name);
                    onFileSelect(file);
                }
            }
        },
        [onFileSelect]
    );

    return (
        <div
            className="relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => { console.log('PDFUploader: container clicked'); document.getElementById('pdf-upload-input')?.click(); }}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: 'url(/crisp-pdf-bg.jpg)' }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center justify-center pt-5 pb-6 z-10">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
            </div>
            <input
                id="pdf-upload-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInput}
            />
        </div>
    );
}
