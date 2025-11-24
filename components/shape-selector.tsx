'use client';

import React, { useState } from 'react';
import { Shapes, Check } from 'lucide-react';
import { ElementType } from '@/lib/types';

interface ShapeSelectorProps {
    value: ElementType | null;
    onChange: (shape: ElementType) => void;
}

interface ShapeOption {
    type: ElementType;
    label: string;
    icon: React.ReactNode;
}

const SHAPE_OPTIONS: ShapeOption[] = [
    {
        type: 'rect',
        label: 'Rectangle',
        icon: <rect x="5" y="10" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'circle',
        label: 'Circle',
        icon: <circle cx="25" cy="25" r="18" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'line',
        label: 'Line',
        icon: <line x1="5" y1="40" x2="45" y2="10" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'triangle',
        label: 'Triangle',
        icon: <path d="M 25,8 L 45,40 L 5,40 Z" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'arrow',
        label: 'Arrow',
        icon: (
            <g>
                <line x1="5" y1="25" x2="35" y2="25" stroke="currentColor" strokeWidth="2" />
                <path d="M 28,18 L 40,25 L 28,32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
            </g>
        ),
    },
    {
        type: 'diamond',
        label: 'Diamond',
        icon: <path d="M 25,5 L 45,25 L 25,45 L 5,25 Z" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'pentagon',
        label: 'Pentagon',
        icon: <path d="M 25,5 L 45,18 L 38,40 L 12,40 L 5,18 Z" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'hexagon',
        label: 'Hexagon',
        icon: <path d="M 15,5 L 35,5 L 45,25 L 35,45 L 15,45 L 5,25 Z" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'star',
        label: 'Star',
        icon: <path d="M 25,5 L 30,18 L 45,18 L 33,28 L 38,42 L 25,33 L 12,42 L 17,28 L 5,18 L 20,18 Z" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
    {
        type: 'heart',
        label: 'Heart',
        icon: <path d="M 25,40 C 25,40 7,28 7,18 C 7,12 10,8 15,8 C 19,8 23,11 25,15 C 27,11 31,8 35,8 C 40,8 43,12 43,18 C 43,28 25,40 25,40 Z" fill="none" stroke="currentColor" strokeWidth="2" />,
    },
];

export function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentShape = SHAPE_OPTIONS.find(s => s.type === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                title="Shapes"
            >
                <Shapes size={18} />
                <span className="text-sm text-gray-700">{currentShape?.label || 'Shapes'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border z-50">
                        <div className="grid grid-cols-3 gap-2" style={{ width: '240px' }}>
                            {SHAPE_OPTIONS.map((shape) => (
                                <button
                                    key={shape.type}
                                    onClick={() => {
                                        onChange(shape.type);
                                        setIsOpen(false);
                                    }}
                                    className={`relative flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors ${value === shape.type ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                                        }`}
                                    title={shape.label}
                                >
                                    <svg width="50" height="50" viewBox="0 0 50 50" className="text-gray-700">
                                        {shape.icon}
                                    </svg>
                                    <span className="text-xs text-gray-600 mt-1">{shape.label}</span>
                                    {value === shape.type && (
                                        <Check size={14} className="absolute top-1 right-1 text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
