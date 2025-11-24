'use client';

import React from 'react';
import { Type, Pen, Calendar, Eraser as EraserIcon, Save } from 'lucide-react';
import { ElementType, BrushStyle } from '@/lib/types';
import { BrushSelector } from './brush-selector';
import { ShapeSelector } from './shape-selector';
import { ColorPicker } from './color-picker';

interface ToolbarProps {
    onAddElement: (type: ElementType) => void;
    activeTool?: ElementType | null;
    onSetTool?: (tool: ElementType | null) => void;
    brushStyle: BrushStyle;
    onBrushStyleChange: (style: BrushStyle) => void;
    fillColor: string;
    onFillColorChange: (color: string) => void;
    strokeColor: string;
    onStrokeColorChange: (color: string) => void;
    strokeWidth: number;
    onStrokeWidthChange: (width: number) => void;
    isEraserActive: boolean;
    onEraserToggle: () => void;
    onSave: () => void;
}

export function Toolbar({
    onAddElement,
    activeTool,
    onSetTool,
    fillColor,
    onFillColorChange,
    strokeColor,
    onStrokeColorChange,
    strokeWidth,
    onStrokeWidthChange,
    isEraserActive,
    onEraserToggle,
    onSave,
}: ToolbarProps) {
    const basicTools = [
        { type: 'text', icon: Type, label: 'Text' },
        { type: 'signature', icon: Pen, label: 'Signature' },
        { type: 'date', icon: Calendar, label: 'Date' },
    ] as const;

    const shapeTools = ['rect', 'circle', 'line', 'triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'];
    const isShapeActive = activeTool && shapeTools.includes(activeTool);

    return (
        <div className="bg-white border-b px-4 py-3 flex items-center gap-4 flex-wrap shadow-sm">
            {/* Basic Tools */}
            <div className="flex items-center gap-2">
                {basicTools.map((tool) => (
                    <button
                        key={tool.type}
                        onClick={() => {
                            onAddElement(tool.type as ElementType);
                            onSetTool?.(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title={tool.label}
                    >
                        <tool.icon size={18} />
                        <span className="text-sm text-gray-700">{tool.label}</span>
                    </button>
                ))}
            </div>

            <div className="h-8 w-px bg-gray-300" />

            {/* Drawing Tools */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onSetTool?.(activeTool === 'path' ? null : 'path')}
                    className={`px-3 py-2 rounded-lg transition-colors ${activeTool === 'path' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                        }`}
                >
                    <BrushSelector onChange={() => { }} />
                </button>

                <ShapeSelector
                    value={isShapeActive ? activeTool : null}
                    onChange={(shape) => onSetTool?.(shape)}
                />
            </div>

            {/* Color Controls - Only show when shape or brush is active */}
            {(isShapeActive || activeTool === 'path') && (
                <>
                    <div className="h-8 w-px bg-gray-300" />

                    <div className="flex items-center gap-2">
                        {isShapeActive && (
                            <ColorPicker label="Fill" value={fillColor} onChange={onFillColorChange} showOpacity />
                        )}
                        <ColorPicker label={isShapeActive ? "Border" : "Color"} value={strokeColor} onChange={onStrokeColorChange} />

                        <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1">{activeTool === 'path' ? 'Brush Size' : 'Width'}</label>
                            <input
                                type="range"
                                min="1"
                                max={activeTool === 'path' ? 20 : 10}
                                value={strokeWidth}
                                onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
                                className="w-24"
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="h-8 w-px bg-gray-300" />

            {/* Eraser */}
            <button
                onClick={onEraserToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isEraserActive ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                    }`}
                title="Eraser (Click elements to delete)"
            >
                <EraserIcon size={18} />
                <span className="text-sm">Eraser</span>
            </button>

            {/* Save Button */}
            <div className="ml-auto">
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Save size={18} />
                    <span className="text-sm font-medium">Save PDF</span>
                </button>
            </div>
        </div>
    );
}
