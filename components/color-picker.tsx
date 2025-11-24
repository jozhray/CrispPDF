'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
    showOpacity?: boolean;
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700',
];

export function ColorPicker({ label, value, onChange, showOpacity = false }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customColor, setCustomColor] = useState(value);
    const [opacity, setOpacity] = useState(100);

    const handlePresetClick = (color: string) => {
        onChange(color);
        setCustomColor(color);
        setIsOpen(false);
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setCustomColor(color);
        onChange(color);
    };

    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newOpacity = parseInt(e.target.value);
        setOpacity(newOpacity);
        // Convert hex to rgba
        const hex = customColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        onChange(`rgba(${r}, ${g}, ${b}, ${newOpacity / 100})`);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                title={label}
            >
                <div
                    className="w-6 h-6 rounded border-2 border-gray-300"
                    style={{ backgroundColor: value }}
                />
                <span className="text-sm text-gray-700">{label}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-xl border z-50 min-w-[280px]">
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Preset Colors
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handlePresetClick(color)}
                                        className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform relative"
                                        style={{ backgroundColor: color, borderColor: color === value ? '#3b82f6' : '#d1d5db' }}
                                    >
                                        {color === value && (
                                            <Check size={16} className="absolute inset-0 m-auto text-white" style={{ filter: 'drop-shadow(0 0 2px black)' }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Custom Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={handleCustomChange}
                                    className="w-12 h-10 rounded border cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={handleCustomChange}
                                    placeholder="#000000"
                                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                />
                            </div>
                        </div>

                        {showOpacity && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Opacity: {opacity}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={opacity}
                                    onChange={handleOpacityChange}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
