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
            className="group relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-blue-200/50 rounded-3xl cursor-pointer bg-white/40 hover:bg-white/60 transition-all overflow-hidden backdrop-blur-md shadow-xl"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => { console.log('PDFUploader: container clicked'); document.getElementById('pdf-upload-input')?.click(); }}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700"
                style={{ backgroundImage: 'url(/crisp-pdf-bg.jpg)' }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center justify-center pt-5 pb-6 z-10 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <p className="mb-2 text-xl text-gray-900">
                    <span className="font-black tracking-tight">Click to upload</span> or drag and drop
                </p>
                <p className="text-gray-500 font-medium">Standard PDF documents up to 10MB</p>
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
