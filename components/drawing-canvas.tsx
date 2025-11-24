'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ElementType, PDFElement, BrushStyle } from '@/lib/types';

interface DrawingCanvasProps {
    width: number;
    height: number;
    page: number;
    activeTool: ElementType | null;
    onAddElement: (element: PDFElement) => void;
    scale: number;
    brushStyle: BrushStyle;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
}

export function DrawingCanvas({ width, height, page, activeTool, onAddElement, scale, brushStyle, strokeColor, fillColor, strokeWidth }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        if (activeTool === 'path' && currentPath.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentPath[0].x * scale, currentPath[0].y * scale);
            for (let i = 1; i < currentPath.length; i++) {
                ctx.lineTo(currentPath[i].x * scale, currentPath[i].y * scale);
            }
            ctx.stroke();
        }
    }, [currentPath, scale, width, height, activeTool]);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            if (e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                return { x: 0, y: 0 };
            }
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) / scale,
            y: (clientY - rect.top) / scale
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!activeTool) return;
        e.preventDefault();

        const pos = getPos(e);
        setIsDrawing(true);
        setStartPos(pos);

        if (activeTool === 'path') {
            setCurrentPath([pos]);
        }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !activeTool || !startPos) return;
        e.preventDefault();

        const pos = getPos(e);

        if (activeTool === 'path') {
            setCurrentPath(prev => [...prev, pos]);
        } else {
            // For shapes, we can draw a preview here if we want
            // For now, we'll just rely on the final mouse up to create the shape
            // To implement preview, we'd need another state for "current shape preview"
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.clearRect(0, 0, width, height);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;

                const startX = startPos.x * scale;
                const startY = startPos.y * scale;
                const currentX = pos.x * scale;
                const currentY = pos.y * scale;

                ctx.beginPath();
                if (activeTool === 'rect') {
                    ctx.rect(startX, startY, currentX - startX, currentY - startY);
                } else if (activeTool === 'circle') {
                    const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
                    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                } else if (activeTool === 'line') {
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(currentX, currentY);
                }
                ctx.stroke();
            }
        }
    };

    const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !activeTool || !startPos) return;
        e.preventDefault();

        const endPos = getPos(e); // Note: for touch, this might be tricky as touches list is empty on end
        // For touch end, we might need to use the last known position from move

        // Simple fix for touch end not having coordinates: use the last point in path or just stop
        // For shapes, we really need the last move position.

        setIsDrawing(false);

        // Create the element
        const id = crypto.randomUUID();
        let newElement: PDFElement | null = null;

        if (activeTool === 'path') {
            if (currentPath.length < 2) return;

            // Convert path points to a flat array for storage
            const points = currentPath.flatMap(p => [p.x, p.y]);

            // Calculate bounding box
            const xs = currentPath.map(p => p.x);
            const ys = currentPath.map(p => p.y);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);

            newElement = {
                id,
                type: 'path',
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
                page,
                points,
                strokeColor: strokeColor,
                strokeWidth: strokeWidth,
                brushStyle: brushStyle
            };
            setCurrentPath([]);
        } else {
            // Shapes
            // We need to use the last position from the canvas state or similar
            // Since we cleared the canvas in handleMove for shapes, let's just use the logic here
            // But we need the final position. 
            // Let's assume mouse up happens at a specific point.
            // If it's touch end, we might need to track lastMovePos.

            // For MVP, let's use the passed event if possible, or fail gracefully.
            // React's onTouchEnd doesn't provide touch coordinates usually.

            // Let's assume mouse for now or that we can get it.
            // Actually, for shapes, let's just use the last move position if we tracked it.
            // Since we didn't track it in state (only drawing to canvas), let's rely on the fact 
            // that for mouse, e is valid. For touch, we might need to improve this.

            // Re-calculating endPos for clarity (it was calculated at start of function)

            const startX = startPos.x;
            const startY = startPos.y;
            const endX = endPos.x;
            const endY = endPos.y;

            if (activeTool === 'rect') {
                newElement = {
                    id,
                    type: 'rect',
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY),
                    page,
                    strokeColor: strokeColor,
                    strokeWidth: strokeWidth,
                    fillColor: fillColor
                };
            } else if (activeTool === 'circle') {
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                newElement = {
                    id,
                    type: 'circle',
                    x: startX - radius,
                    y: startY - radius,
                    width: radius * 2,
                    height: radius * 2,
                    page,
                    strokeColor: strokeColor,
                    strokeWidth: strokeWidth,
                    fillColor: fillColor
                };
            } else if (activeTool === 'line') {
                newElement = {
                    id,
                    type: 'line',
                    x: startX,
                    y: startY,
                    width: endX - startX,
                    height: endY - startY,
                    page,
                    points: [startX, startY, endX, endY],
                    strokeColor: strokeColor,
                    strokeWidth: strokeWidth
                };
            } else if (['triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'].includes(activeTool)) {
                // All advanced shapes use same bounding box approach
                newElement = {
                    id,
                    type: activeTool as ElementType,
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY),
                    page,
                    strokeColor: strokeColor,
                    strokeWidth: strokeWidth,
                    fillColor: fillColor
                };
            }
        }

        if (newElement) {
            onAddElement(newElement);
        }

        setStartPos(null);

        // Clear canvas
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, width, height);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 z-20 cursor-crosshair touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        />
    );
}
