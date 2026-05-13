'use client';

import React, { useState } from 'react';
import { PDFEditor } from '@/components/pdf-editor';
import { PDFMerger } from '@/components/pdf-merger';
import { PDFSplitter } from '@/components/pdf-splitter';
import { FileEdit, Merge, Scissors, Sparkles } from 'lucide-react';

type Tool = 'edit' | 'merge' | 'split';

export default function Home() {
    const [activeTool, setActiveTool] = useState<Tool>('edit');

    return (
        <main className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-slate-900">
            {/* Immersive Background Image */}
            <div 
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center bg-no-repeat scale-105"
                style={{ backgroundImage: 'url(/crisp-pdf-bg.jpg)' }}
            ></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-blue-900/5 to-slate-900/40"></div>

            <header className="relative z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 px-8 py-3 flex items-center justify-between sticky top-0 shadow-sm">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTool('edit')}>
                    <div className="h-14 flex items-center justify-center transition-transform group-hover:scale-110">
                        <img src="/logo.png" alt="CrispPDF Logo" className="h-full object-contain drop-shadow-lg" />
                    </div>
                    <div className="hidden sm:block border-l border-gray-300 h-8 mx-2 opacity-50"></div>
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Professional</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 leading-none">Edition</p>
                    </div>
                </div>

                <nav className="hidden md:flex items-center bg-gray-200/50 backdrop-blur-sm p-1 rounded-2xl border border-white/50 shadow-inner">
                    <button 
                        onClick={() => setActiveTool('edit')}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                            ${activeTool === 'edit' 
                                ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}
                        `}
                    >
                        <FileEdit className="w-5 h-5" />
                        PDF Editor
                    </button>
                    <button 
                        onClick={() => setActiveTool('merge')}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                            ${activeTool === 'merge' 
                                ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}
                        `}
                    >
                        <Merge className="w-5 h-5" />
                        Merge
                    </button>
                    <button 
                        onClick={() => setActiveTool('split')}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                            ${activeTool === 'split' 
                                ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}
                        `}
                    >
                        <Scissors className="w-5 h-5" />
                        Split
                    </button>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end">
                        <p className="text-sm font-bold text-gray-900">Premium User</p>
                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Secure Session
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-white/80 border border-gray-200 flex items-center justify-center rounded-full shadow-sm text-gray-600 font-bold">
                        JD
                    </div>
                </div>
            </header>

            {/* Mobile Nav */}
            <nav className="md:hidden relative z-50 flex items-center justify-around bg-white/70 backdrop-blur-md border-b border-gray-200/50 p-2 overflow-x-auto">
                {/* ... (keep existing mobile nav but update styles slightly if needed) ... */}
                <button 
                    onClick={() => setActiveTool('edit')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[80px] rounded-xl ${activeTool === 'edit' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400'}`}
                >
                    <FileEdit className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Edit</span>
                </button>
                <button 
                    onClick={() => setActiveTool('merge')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[80px] rounded-xl ${activeTool === 'merge' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400'}`}
                >
                    <Merge className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Merge</span>
                </button>
                <button 
                    onClick={() => setActiveTool('split')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[80px] rounded-xl ${activeTool === 'split' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400'}`}
                >
                    <Scissors className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Split</span>
                </button>
            </nav>

            <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
                {activeTool === 'edit' && <PDFEditor />}
                {activeTool === 'merge' && <PDFMerger />}
                {activeTool === 'split' && <PDFSplitter />}
            </div>

            <footer className="relative z-50 bg-white/70 backdrop-blur-md border-t border-gray-200/50 px-8 py-3 flex items-center justify-between text-[11px] font-medium text-gray-400">
                <p>© 2024 CrispPDF. Encrypted & Secure.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
                </div>
            </footer>
        </main>
    );
}
