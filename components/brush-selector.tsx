'use client';

import React from 'react';
import { Paintbrush } from 'lucide-react';

interface BrushSelectorProps {
    onChange: () => void;
}

export function BrushSelector({ onChange }: BrushSelectorProps) {
    return (
        <div className="relative">
            <button
                onClick={onChange}
                className="flex items-center gap-2 hover:bg-gray-100 transition-colors px-2 py-1 rounded"
                title="Brush Tool"
            >
                <Paintbrush size={16} />
                <span className="text-sm">Brush</span>
            </button>
        </div>
    );
}
