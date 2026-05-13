'use client';

import React, { useState } from 'react';
import { Upload, Scissors, CheckCircle2, Download, Loader2, CheckSquare } from 'lucide-react';
import { splitPDF, getPageCount } from '@/lib/pdf-utils';
import { PDFThumbnail } from './pdf-thumbnail';

export function PDFSplitter() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isSplitting, setIsSplitting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const count = await getPageCount(selectedFile);
            setFile(selectedFile);
            setPageCount(count);
            setSelectedPages([]);
        }
    };

    const togglePage = (index: number) => {
        setSelectedPages(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index].sort((a, b) => a - b)
        );
    };

    const handleSplit = async () => {
        if (!file || selectedPages.length === 0) return;
        
        setIsSplitting(true);
        try {
            const pdfBytes = await splitPDF(file, selectedPages);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            link.download = `${originalName}_split.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Error splitting PDF:', error);
            alert('Failed to split PDF.');
        } finally {
            setIsSplitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full w-full bg-transparent overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-6xl">
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden shadow-blue-900/20">
                        <div className="p-10 md:p-16">
                            <div className="text-center mb-12">
                                <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Split Document</h2>
                                <p className="text-gray-600 text-xl font-medium opacity-80">Hand-pick pages to extract into a brand new PDF file.</p>
                            </div>

                            {!file ? (
                                <div 
                                    className="border-2 border-dashed border-blue-200/50 rounded-3xl p-20 bg-white/30 hover:bg-white/60 transition-all flex flex-col items-center justify-center cursor-pointer group backdrop-blur-md"
                                    onClick={() => document.getElementById('split-upload')?.click()}
                                >
                                    <input
                                        id="split-upload"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                                        <Upload className="w-12 h-12 text-blue-600" />
                                    </div>
                                    <p className="text-2xl text-gray-900 font-black mb-2">Click to Upload PDF</p>
                                    <p className="text-gray-500 font-bold">Select a document to start extraction</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between bg-white/60 p-6 rounded-2xl border border-white/40">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-xl shadow-sm">
                                                <Scissors className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900">{file.name}</p>
                                                <p className="text-sm font-bold text-gray-500">{pageCount} total pages</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setFile(null)}
                                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            Change File
                                        </button>
                                    </div>

                                    <div className="bg-white/40 p-8 rounded-3xl border border-white/40">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                                Select Pages to Extract
                                                <span className="text-sm font-bold bg-blue-600 text-white px-3 py-1 rounded-full">{selectedPages.length} selected</span>
                                            </h3>
                                            <div className="flex gap-4">
                                                <button onClick={() => setSelectedPages(Array.from({ length: pageCount }, (_, i) => i))} className="text-xs font-black text-blue-600 hover:underline">SELECT ALL</button>
                                                <button onClick={() => setSelectedPages([])} className="text-xs font-black text-gray-400 hover:underline">CLEAR</button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                                            {Array.from({ length: pageCount }, (_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => togglePage(i)}
                                                    className={`
                                                        relative aspect-[3/4] rounded-2xl border-2 transition-all overflow-hidden group
                                                        ${selectedPages.includes(i) 
                                                            ? 'border-blue-600 ring-4 ring-blue-100 shadow-2xl' 
                                                            : 'border-white/60 bg-white/20 hover:border-blue-200 hover:bg-white/40'}
                                                    `}
                                                >
                                                    <PDFThumbnail file={file} pageNumber={i + 1} scale={0.2} />
                                                    
                                                    <div className={`
                                                        absolute inset-0 flex items-center justify-center transition-all
                                                        ${selectedPages.includes(i) ? 'bg-blue-600/10' : 'bg-transparent group-hover:bg-gray-100/20'}
                                                    `}>
                                                        {selectedPages.includes(i) && (
                                                            <CheckSquare className="w-8 h-8 text-blue-600 drop-shadow-xl animate-in zoom-in duration-200" />
                                                        )}
                                                    </div>
                                                    <div className={`
                                                        absolute bottom-0 left-0 right-0 py-1 text-[10px] font-black text-center uppercase tracking-widest
                                                        ${selectedPages.includes(i) ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-400'}
                                                    `}>
                                                        PAGE {i + 1}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSplit}
                                            disabled={selectedPages.length === 0 || isSplitting}
                                            className={`
                                                flex items-center gap-3 px-16 py-6 rounded-2xl font-black text-xl transition-all shadow-2xl
                                                ${selectedPages.length === 0 || isSplitting
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:translate-y-[-4px] active:translate-y-0 shadow-blue-300'
                                                }
                                            `}
                                        >
                                            {isSplitting ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    Splitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-8 h-8" />
                                                    Extract {selectedPages.length} Pages
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
