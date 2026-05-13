'use client';

import React, { useState } from 'react';
import { Upload, File, X, Plus, Download, Loader2, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { mergePDFs, getPageCount } from '@/lib/pdf-utils';
import { PDFThumbnail } from './pdf-thumbnail';

interface MergeFile {
    id: string;
    file: File;
    pageCount: number;
    selectedPages: number[];
    isExpanded: boolean;
}

export function PDFMerger() {
    const [mergeFiles, setMergeFiles] = useState<MergeFile[]>([]);
    const [isMerging, setIsMerging] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newMergeFiles: MergeFile[] = await Promise.all(
                newFiles.map(async (file) => {
                    const count = await getPageCount(file);
                    return {
                        id: crypto.randomUUID(),
                        file,
                        pageCount: count,
                        selectedPages: Array.from({ length: count }, (_, i) => i),
                        isExpanded: false
                    };
                })
            );
            setMergeFiles(prev => [...prev, ...newMergeFiles]);
        }
    };

    const removeFile = (id: string) => {
        setMergeFiles(prev => prev.filter(f => f.id !== id));
    };

    const toggleExpand = (id: string) => {
        setMergeFiles(prev => prev.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
    };

    const togglePage = (fileId: string, pageIndex: number) => {
        setMergeFiles(prev => prev.map(f => {
            if (f.id === fileId) {
                const selectedPages = f.selectedPages.includes(pageIndex)
                    ? f.selectedPages.filter(i => i !== pageIndex)
                    : [...f.selectedPages, pageIndex].sort((a, b) => a - b);
                return { ...f, selectedPages };
            }
            return f;
        }));
    };

    const selectAll = (fileId: string) => {
        setMergeFiles(prev => prev.map(f => f.id === fileId ? { ...f, selectedPages: Array.from({ length: f.pageCount }, (_, i) => i) } : f));
    };

    const selectNone = (fileId: string) => {
        setMergeFiles(prev => prev.map(f => f.id === fileId ? { ...f, selectedPages: [] } : f));
    };

    const handleMerge = async () => {
        const entries = mergeFiles
            .filter(f => f.selectedPages.length > 0)
            .map(f => ({ file: f.file, pageIndices: f.selectedPages }));
            
        if (entries.length === 0) return;
        
        setIsMerging(true);
        try {
            const mergedPdfBytes = await mergePDFs(entries);
            const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const now = new Date();
            const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
            link.download = `merged_${timestamp}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Failed to merge PDFs.');
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full w-full bg-transparent overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-6xl">
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden shadow-blue-900/20">
                        <div className="p-10 md:p-16">
                            <div className="text-center mb-12">
                                <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Merge Documents</h2>
                                <p className="text-gray-600 text-xl font-medium opacity-80">Combine specific pages from multiple PDFs into one premium document.</p>
                            </div>

                            {!mergeFiles.length ? (
                                <div 
                                    className="border-2 border-dashed border-blue-200/50 rounded-3xl p-20 bg-white/30 hover:bg-white/60 transition-all flex flex-col items-center justify-center cursor-pointer group backdrop-blur-md"
                                    onClick={() => document.getElementById('merge-upload')?.click()}
                                >
                                    <input
                                        id="merge-upload"
                                        type="file"
                                        multiple
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                                        <Upload className="w-12 h-12 text-blue-600" />
                                    </div>
                                    <p className="text-2xl text-gray-900 font-black mb-2">Click to Upload PDFs</p>
                                    <p className="text-gray-500 font-bold">Select two or more files to start merging</p>
                                </div>
                            ) : (
                                <div className="space-y-6 mb-10">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-xl font-bold text-gray-800">Your Documents ({mergeFiles.length})</h3>
                                        <button 
                                            onClick={() => setMergeFiles([])}
                                            className="text-sm text-red-500 hover:text-red-600 font-bold uppercase tracking-wider"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    
                                    {mergeFiles.map((mergeFile) => (
                                        <div 
                                            key={mergeFile.id}
                                            className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all"
                                        >
                                            <div className="flex items-center gap-4 p-5">
                                                <div className="bg-white p-3 rounded-xl shadow-sm">
                                                    <File className="w-7 h-7 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-lg font-bold text-gray-900 truncate">{mergeFile.file.name}</p>
                                                    <p className="text-sm text-blue-600 font-semibold">
                                                        {mergeFile.selectedPages.length} / {mergeFile.pageCount} pages selected
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleExpand(mergeFile.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all font-bold text-sm flex items-center gap-1 bg-white/50"
                                                    >
                                                        {mergeFile.isExpanded ? (
                                                            <>Collapse <ChevronUp className="w-4 h-4" /></>
                                                        ) : (
                                                            <>Select Pages <ChevronDown className="w-4 h-4" /></>
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => removeFile(mergeFile.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <X className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>

                                            {mergeFile.isExpanded && (
                                                <div className="bg-white border-t border-gray-100 p-6">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Page Picker</p>
                                                        <div className="flex gap-4">
                                                            <button onClick={() => selectAll(mergeFile.id)} className="text-xs font-black text-blue-600 hover:underline">SELECT ALL</button>
                                                            <button onClick={() => selectNone(mergeFile.id)} className="text-xs font-black text-gray-400 hover:underline">CLEAR</button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                                        {Array.from({ length: mergeFile.pageCount }, (_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => togglePage(mergeFile.id, i)}
                                                                className={`
                                                                    relative aspect-[3/4] rounded-xl border-2 transition-all overflow-hidden group
                                                                    ${mergeFile.selectedPages.includes(i) 
                                                                        ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' 
                                                                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-blue-300'}
                                                                `}
                                                            >
                                                                <PDFThumbnail file={mergeFile.file} pageNumber={i + 1} scale={0.2} />
                                                                
                                                                <div className={`
                                                                    absolute inset-0 flex items-center justify-center transition-all
                                                                    ${mergeFile.selectedPages.includes(i) ? 'bg-blue-600/10' : 'bg-transparent group-hover:bg-gray-100/40'}
                                                                `}>
                                                                    {mergeFile.selectedPages.includes(i) && (
                                                                        <CheckSquare className="w-6 h-6 text-blue-600 drop-shadow-md" />
                                                                    )}
                                                                </div>
                                                                <div className={`
                                                                    absolute bottom-0 left-0 right-0 py-0.5 text-[8px] font-black text-center uppercase
                                                                    ${mergeFile.selectedPages.includes(i) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}
                                                                `}>
                                                                    P. {i + 1}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={() => document.getElementById('merge-upload')?.click()}
                                        className="w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3 font-bold text-lg"
                                    >
                                        <Plus className="w-6 h-6" />
                                        Add More Documents
                                    </button>

                                    <div className="flex justify-end pt-8 border-t border-gray-100">
                                        <button
                                            onClick={handleMerge}
                                            disabled={mergeFiles.length === 0 || isMerging || mergeFiles.every(f => f.selectedPages.length === 0)}
                                            className={`
                                                flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl
                                                ${mergeFiles.length === 0 || isMerging || mergeFiles.every(f => f.selectedPages.length === 0)
                                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:translate-y-[-4px] active:translate-y-0 shadow-blue-200'
                                                }
                                            `}
                                        >
                                            {isMerging ? (
                                                <>
                                                    <Loader2 className="w-7 h-7 animate-spin" />
                                                    Processing PDFs...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-7 h-7" />
                                                    Merge {mergeFiles.reduce((acc, f) => acc + f.selectedPages.length, 0)} Pages
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
