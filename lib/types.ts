export type ElementType = 'text' | 'image' | 'date' | 'signature' | 'path' | 'rect' | 'circle' | 'line' | 'triangle' | 'arrow' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'heart';

export type BrushStyle = 'regular' | 'calligraphy' | 'marker' | 'pencil' | 'airbrush' | 'crayon';

export interface PDFElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    content?: string; // For text, image data URL, or SVG path data
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    fontWeight?: string; // 'normal', 'bold'
    fontStyle?: string; // 'normal', 'italic'
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    points?: number[]; // For paths or lines [x1, y1, x2, y2, ...]
    brushStyle?: BrushStyle; // For path elements
    eraserMask?: string; // Data URL of the eraser mask canvas for pixel-perfect erasing
    arrowDirection?: 'right' | 'left' | 'up' | 'down' | 'double'; // For arrow elements
}
