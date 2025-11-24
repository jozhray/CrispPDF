'use client';

import React from 'react';
import { Bold, Italic, Type } from 'lucide-react';
import { PDFElement } from '@/lib/types';

interface StyleToolbarProps {
    element: PDFElement | null;
    onUpdate: (updates: Partial<PDFElement>) => void;
}

export function StyleToolbar({ element, onUpdate }: StyleToolbarProps) {
    if (!element) return null;

    const isTextElement = element.type === 'text' || element.type === 'date';
    const isShapeElement = ['rect', 'circle', 'triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'].includes(element.type);

    if (!isTextElement && !isShapeElement) return null;

    const colors = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];
    const fontSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];

    return (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg border flex items-center gap-4 z-30 animate-in fade-in slide-in-from-top-4">
            {/* Text Element Controls */}
            {isTextElement && (
                <>
                    {/* Font Size */}
                    <div className="flex items-center gap-2 border-r pr-4">
                        <Type size={16} className="text-gray-500" />
                        <select
                            value={element.fontSize || 16}
                            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                            className="bg-transparent focus:outline-none text-sm"
                        >
                            {fontSizes.map(size => (
                                <option key={size} value={size}>{size}px</option>
                            ))}
                        </select>
                    </div>

                    {/* Font Style */}
                    <div className="flex items-center gap-1 border-r pr-4">
                        <button
                            onClick={() => onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${element.fontWeight === 'bold' ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
                            title="Bold"
                        >
                            <Bold size={16} />
                        </button>
                        <button
                            onClick={() => onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${element.fontStyle === 'italic' ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
                            title="Italic"
                        >
                            <Italic size={16} />
                        </button>
                    </div>

                    {/* Text Color */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 mr-1">Color:</span>
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => onUpdate({ color })}
                                className={`w-5 h-5 rounded-full border border-gray-200 ${element.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Shape Element Controls */}
            {isShapeElement && (
                <>
                    {/* Fill Color */}
                    <div className="flex items-center gap-2 border-r pr-4">
                        <span className="text-xs text-gray-600 mr-1">Fill:</span>
                        <button
                            onClick={() => onUpdate({ fillColor: 'transparent' })}
                            className={`w-5 h-5 rounded border border-gray-300 ${element.fillColor === 'transparent' || !element.fillColor ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                            title="Transparent"
                        >
                            <div className="w-full h-full" style={{
                                background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 8px 8px'
                            }} />
                        </button>
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => onUpdate({ fillColor: color })}
                                className={`w-5 h-5 rounded border border-gray-200 ${element.fillColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>

                    {/* Border Color */}
                    <div className="flex items-center gap-2 border-r pr-4">
                        <span className="text-xs text-gray-600 mr-1">Border:</span>
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => onUpdate({ strokeColor: color })}
                                className={`w-5 h-5 rounded border border-gray-200 ${element.strokeColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>

                    {/* Border Width */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 mr-1">Width:</span>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={element.strokeWidth || 2}
                            onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
                            className="w-20"
                        />
                        <span className="text-xs text-gray-500">{element.strokeWidth || 2}px</span>
                    </div>
                </>
            )}
        </div>
    );
}
