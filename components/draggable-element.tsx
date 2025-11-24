'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PDFElement } from '@/lib/types';
import { X } from 'lucide-react';

interface DraggableElementProps {
    element: PDFElement;
    onUpdate: (id: string, updates: Partial<PDFElement>) => void;
    onDelete: (id: string) => void;
    onEdit?: (id: string) => void;
    onSelect?: (id: string) => void;
    scale: number;
}

export function DraggableElement({
    element,
    onUpdate,
    onDelete,
    onEdit,
    onSelect,
    scale,
}: DraggableElementProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(element.content || '');
    const [isResizing, setIsResizing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const draggedRef = useRef(false);

    useEffect(() => {
        setEditValue(element.content || '');
    }, [element.content]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing || isResizing) return;
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = element.x;
        const startTop = element.y;
        draggedRef.current = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const dy = (moveEvent.clientY - startY) / scale;

            if (Math.abs(moveEvent.clientX - startX) > 5 || Math.abs(moveEvent.clientY - startY) > 5) {
                draggedRef.current = true;
            }

            onUpdate(element.id, {
                x: startLeft + dx,
                y: startTop + dy,
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setTimeout(() => {
                draggedRef.current = false;
            }, 100);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isEditing || isResizing) return;
        // Prevent default to stop scrolling while dragging
        // e.preventDefault(); // Commented out to allow scrolling if not dragging, but we might need it.
        // Better to stop propagation
        e.stopPropagation();

        const touch = e.touches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;
        const startLeft = element.x;
        const startTop = element.y;
        draggedRef.current = false;

        const handleTouchMove = (moveEvent: TouchEvent) => {
            moveEvent.preventDefault(); // Prevent scrolling while dragging
            const moveTouch = moveEvent.touches[0];
            const dx = (moveTouch.clientX - startX) / scale;
            const dy = (moveTouch.clientY - startY) / scale;

            if (Math.abs(moveTouch.clientX - startX) > 5 || Math.abs(moveTouch.clientY - startY) > 5) {
                draggedRef.current = true;
            }

            onUpdate(element.id, {
                x: startLeft + dx,
                y: startTop + dy,
            });
        };

        const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            setTimeout(() => {
                draggedRef.current = false;
            }, 100);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        const resizableTypes = ['signature', 'rect', 'circle', 'triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'];
        if (!resizableTypes.includes(element.type)) return;

        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        draggedRef.current = true;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.width || 200;
        const startHeight = element.height || 50;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) / scale;
            const newWidth = Math.max(50, startWidth + dx);
            const newHeight = newWidth / aspectRatio;

            onUpdate(element.id, {
                width: newWidth,
                height: newHeight,
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setTimeout(() => {
                draggedRef.current = false;
            }, 100);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeTouchStart = (e: React.TouchEvent) => {
        const resizableTypes = ['signature', 'rect', 'circle', 'triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'];
        if (!resizableTypes.includes(element.type)) return;

        e.stopPropagation();
        // e.preventDefault(); // Prevent default to stop scrolling
        setIsResizing(true);
        draggedRef.current = true;

        const touch = e.touches[0];
        const startX = touch.clientX;
        const startWidth = element.width || 200;
        const startHeight = element.height || 50;
        const aspectRatio = startWidth / startHeight;

        const handleTouchMove = (moveEvent: TouchEvent) => {
            moveEvent.preventDefault(); // Prevent scrolling while resizing
            const moveTouch = moveEvent.touches[0];
            const dx = (moveTouch.clientX - startX) / scale;
            const newWidth = Math.max(50, startWidth + dx);
            const newHeight = newWidth / aspectRatio;

            onUpdate(element.id, {
                width: newWidth,
                height: newHeight,
            });
        };

        const handleTouchEnd = () => {
            setIsResizing(false);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            setTimeout(() => {
                draggedRef.current = false;
            }, 100);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (element.type === 'text' || element.type === 'date') {
            setIsEditing(true);
        } else if (element.type === 'signature') {
            if (onEdit) {
                onEdit(element.id);
            } else {
                fileInputRef.current?.click();
            }
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        onUpdate(element.id, { content: editValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onUpdate(element.id, { content: e.target.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (draggedRef.current) return;

        if (onSelect) {
            onSelect(element.id);
        }
    };

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x * scale}px`,
        top: `${element.y * scale}px`,
        cursor: isEditing ? 'text' : 'move',
        border: isEditing ? '1px solid #3b82f6' : '1px dashed transparent',
        padding: '4px',
        backgroundColor: isEditing ? 'white' : 'transparent',
        zIndex: isEditing ? 30 : 20,
    };

    const canResize = ['signature', 'rect', 'circle', 'triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'].includes(element.type);

    return (
        <div
            ref={elementRef}
            style={style}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(element.id);
                }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                style={{
                    zIndex: 100,
                    opacity: isHovered ? 1 : 0,
                    pointerEvents: isHovered ? 'auto' : 'none'
                }}
            >
                <X size={16} />
            </button>

            {element.type === 'text' &&
                (isEditing ? (
                    <textarea
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent outline-none resize-none overflow-hidden min-w-[100px]"
                        style={{
                            fontFamily: element.fontFamily,
                            fontSize: `${(element.fontSize || 16) * scale}px`,
                            color: element.color,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                            height: 'auto',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            fontFamily: element.fontFamily,
                            fontSize: `${(element.fontSize || 16) * scale}px`,
                            color: element.color,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                            whiteSpace: 'pre-wrap',
                            minWidth: '20px',
                            minHeight: '20px',
                        }}
                    >
                        {element.content || 'Text'}
                    </div>
                ))}

            {element.type === 'signature' && (
                <div style={{ position: 'relative' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {element.content ? (
                        <>
                            <img
                                src={element.content}
                                alt="Signature"
                                style={{
                                    width: `${(element.width || 200) * scale}px`,
                                    height: `${(element.height || 50) * scale}px`,
                                    pointerEvents: 'none',
                                }}
                            />
                            {isHovered && (
                                <div
                                    onMouseDown={handleResizeMouseDown}
                                    onTouchStart={handleResizeTouchStart}
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize hover:bg-blue-600"
                                    style={{ zIndex: 101 }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-gray-400 text-xs border border-gray-300 p-2">
                            Double click to upload signature
                        </div>
                    )}
                </div>
            )}

            {element.type === 'date' &&
                (isEditing ? (
                    <input
                        type="date"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent outline-none min-w-[100px]"
                        style={{
                            fontSize: `${(element.fontSize || 16) * scale}px`,
                            color: element.color,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                        }}
                    />
                ) : (
                    <div
                        style={{
                            fontSize: `${(element.fontSize || 16) * scale}px`,
                            color: element.color,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                        }}
                    >
                        {element.content || new Date().toLocaleDateString()}
                    </div>
                ))}

            {element.type === 'path' && element.points && (
                <svg
                    width={element.width * scale}
                    height={element.height * scale}
                    style={{ overflow: 'visible', pointerEvents: 'none' }}
                >
                    <polyline
                        points={element.points.map((p, i) => i % 2 === 0 ? `${(p - element.x) * scale},${(element.points![i + 1] - element.y) * scale}` : '').filter(Boolean).join(' ')}
                        fill="none"
                        stroke={element.strokeColor || 'black'}
                        strokeWidth={element.strokeWidth || 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}

            {element.type === 'rect' && (
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            width: `${element.width * scale}px`,
                            height: `${element.height * scale}px`,
                            border: `${element.strokeWidth || 2}px solid ${element.strokeColor || 'black'}`,
                            backgroundColor: element.fillColor || 'transparent',
                        }}
                    />
                    {isHovered && canResize && (
                        <div
                            onMouseDown={handleResizeMouseDown}
                            onTouchStart={handleResizeTouchStart}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize hover:bg-blue-600"
                            style={{ zIndex: 101 }}
                        />
                    )}
                </div>
            )}

            {element.type === 'circle' && (
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            width: `${element.width * scale}px`,
                            height: `${element.height * scale}px`,
                            borderRadius: '50%',
                            border: `${element.strokeWidth || 2}px solid ${element.strokeColor || 'black'}`,
                            backgroundColor: element.fillColor || 'transparent',
                        }}
                    />
                    {isHovered && canResize && (
                        <div
                            onMouseDown={handleResizeMouseDown}
                            onTouchStart={handleResizeTouchStart}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize hover:bg-blue-600"
                            style={{ zIndex: 101 }}
                        />
                    )}
                </div>
            )}

            {element.type === 'line' && element.points && (
                <svg
                    width={Math.abs(element.points[2] - element.points[0]) * scale}
                    height={Math.abs(element.points[3] - element.points[1]) * scale}
                    style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                    <line
                        x1={0}
                        y1={0}
                        x2={(element.points[2] - element.points[0]) * scale}
                        y2={(element.points[3] - element.points[1]) * scale}
                        stroke={element.strokeColor || 'black'}
                        strokeWidth={element.strokeWidth || 2}
                    />
                </svg>
            )}

            {['triangle', 'arrow', 'diamond', 'pentagon', 'hexagon', 'star', 'heart'].includes(element.type) && (
                <div style={{ position: 'relative' }}>
                    <svg
                        width={element.width * scale}
                        height={element.height * scale}
                        style={{ overflow: 'visible' }}
                    >
                        <path
                            d={(() => {
                                const w = element.width * scale;
                                const h = element.height * scale;
                                const cx = w / 2;
                                const cy = h / 2;

                                switch (element.type) {
                                    case 'triangle':
                                        return `M ${cx} 0 L ${w} ${h} L 0 ${h} Z`;
                                    case 'arrow':
                                        const ah = h / 3;
                                        return `M 0 ${ah} L ${w * 0.7} ${ah} L ${w * 0.7} 0 L ${w} ${cy} L ${w * 0.7} ${h} L ${w * 0.7} ${h - ah} L 0 ${h - ah} Z`;
                                    case 'diamond':
                                        return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`;
                                    case 'pentagon':
                                        const pentPoints = Array.from({ length: 5 }, (_, i) => {
                                            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                                            return `${cx + cx * Math.cos(angle)},${cy + cy * Math.sin(angle)}`;
                                        });
                                        return `M ${pentPoints.join(' L ')} Z`;
                                    case 'hexagon':
                                        const hexPoints = Array.from({ length: 6 }, (_, i) => {
                                            const angle = (i * 2 * Math.PI) / 6;
                                            return `${cx + cx * Math.cos(angle)},${cy + cy * Math.sin(angle)}`;
                                        });
                                        return `M ${hexPoints.join(' L ')} Z`;
                                    case 'star':
                                        const starPoints = Array.from({ length: 10 }, (_, i) => {
                                            const angle = (i * Math.PI) / 5 - Math.PI / 2;
                                            const radius = i % 2 === 0 ? cx : cx * 0.4;
                                            return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
                                        });
                                        return `M ${starPoints.join(' L ')} Z`;
                                    case 'heart':
                                        return `M ${cx} ${h * 0.3} C ${cx} ${h * 0.15}, ${w * 0.65} 0, ${w * 0.75} ${h * 0.2} C ${w * 0.9} ${h * 0.35}, ${w * 0.9} ${h * 0.55}, ${cx} ${h} C ${w * 0.1} ${h * 0.55}, ${w * 0.1} ${h * 0.35}, ${w * 0.25} ${h * 0.2} C ${w * 0.35} 0, ${cx} ${h * 0.15}, ${cx} ${h * 0.3} Z`;
                                    default:
                                        return '';
                                }
                            })()}
                            fill={element.fillColor || 'transparent'}
                            stroke={element.strokeColor || 'black'}
                            strokeWidth={element.strokeWidth || 2}
                        />
                    </svg>
                    {isHovered && canResize && (
                        <div
                            onMouseDown={handleResizeMouseDown}
                            onTouchStart={handleResizeTouchStart}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize hover:bg-blue-600"
                            style={{ zIndex: 101 }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
