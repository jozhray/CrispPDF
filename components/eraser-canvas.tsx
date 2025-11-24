'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PDFElement } from '@/lib/types';

interface EraserCanvasProps {
    width: number;
    height: number;
    page: number;
    scale: number;
    elements: PDFElement[];
    onElementUpdate: (id: string, updates: Partial<PDFElement>) => void;
    eraserSize?: number;
}

export function EraserCanvas({
    width,
    height,
    page,
    scale,
    elements,
    onElementUpdate,
    eraserSize = 20,
}: EraserCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isErasing, setIsErasing] = useState(false);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const maskCanvasesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width * scale, height * scale);

        // Draw eraser cursor if hovering
        if (cursorPos) {
            ctx.beginPath();
            ctx.arc(cursorPos.x * scale, cursorPos.y * scale, eraserSize / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }, [cursorPos, width, height, scale, eraserSize]);

    const getPos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale,
        };
    };

    const eraseAtPoint = (x: number, y: number) => {
        const pageElements = elements.filter(el => el.page === page);

        pageElements.forEach(element => {
            // Check if erase point is within element bounds
            const inBounds =
                x >= element.x - eraserSize / 2 &&
                x <= element.x + element.width + eraserSize / 2 &&
                y >= element.y - eraserSize / 2 &&
                y <= element.y + element.height + eraserSize / 2;

            if (!inBounds) return;

            // Get or create mask canvas for this element
            let maskCanvas = maskCanvasesRef.current.get(element.id);
            if (!maskCanvas) {
                maskCanvas = document.createElement('canvas');
                maskCanvas.width = Math.max(element.width * 2, 100);
                maskCanvas.height = Math.max(element.height * 2, 100);

                const maskCtx = maskCanvas.getContext('2d');
                if (maskCtx) {
                    // If element already has a mask, load it
                    if (element.eraserMask) {
                        const img = new Image();
                        img.onload = () => {
                            maskCtx.drawImage(img, 0, 0);
                        };
                        img.src = element.eraserMask;
                    }
                }
                maskCanvasesRef.current.set(element.id, maskCanvas);
            }

            const maskCtx = maskCanvas.getContext('2d');
            if (!maskCtx) return;

            // Draw eraser circle on mask (in element's local coordinates)
            const localX = (x - element.x) * 2; // *2 for higher resolution
            const localY = (y - element.y) * 2;

            maskCtx.globalCompositeOperation = 'destination-out';
            maskCtx.beginPath();
            maskCtx.arc(localX, localY, eraserSize, 0, 2 * Math.PI);
            maskCtx.fill();
            maskCtx.globalCompositeOperation = 'source-over';

            // Convert mask to data URL and update element
            const maskDataUrl = maskCanvas.toDataURL();
            onElementUpdate(element.id, { eraserMask: maskDataUrl });
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsErasing(true);

        const pos = getPos(e);
        eraseAtPoint(pos.x, pos.y);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const pos = getPos(e);
        setCursorPos(pos);

        if (isErasing) {
            eraseAtPoint(pos.x, pos.y);
        }
    };

    const handleMouseUp = () => {
        setIsErasing(false);
    };

    const handleMouseLeave = () => {
        setCursorPos(null);
        setIsErasing(false);
    };

    return (
        <canvas
            ref={canvasRef}
            width={width * scale}
            height={height * scale}
            className="absolute top-0 left-0 cursor-none"
            style={{
                pointerEvents: 'auto',
                zIndex: 999,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        />
    );
}
