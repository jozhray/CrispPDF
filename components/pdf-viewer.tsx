'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFElement, ElementType, BrushStyle } from '@/lib/types';
import { DraggableElement } from './draggable-element';
import { DrawingCanvas } from './drawing-canvas';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';


// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
    file: File;
    elements: PDFElement[];
    onElementUpdate: (id: string, updates: Partial<PDFElement>) => void;
    onElementDelete: (id: string) => void;
    onElementEdit?: (id: string) => void;
    onElementSelect?: (id: string) => void;
    activeTool?: ElementType | null;
    onAddDrawingElement?: (element: PDFElement) => void;
    brushStyle?: BrushStyle;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
}

export function PDFViewer({
    file,
    elements,
    onElementUpdate,
    onElementDelete,
    onElementEdit,
    onElementSelect,
    activeTool,
    onAddDrawingElement,
    brushStyle,
    strokeColor,
    fillColor,
    strokeWidth,
}: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <div className="h-full overflow-auto flex justify-center p-8">
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col gap-8"
            >
                {Array.from({ length: numPages }, (_, index) => (
                    <div key={`page_${index + 1}`} className="relative shadow-lg">
                        <Page
                            pageNumber={index + 1}
                            scale={scale}
                            onLoadSuccess={(page) => {
                                // We can use page dimensions if needed
                            }}
                        />
                        {/* Render draggable elements for this page */}
                        {elements
                            .filter((el) => el.page === index + 1)
                            .map((el) => (
                                <DraggableElement
                                    key={el.id}
                                    element={el}
                                    onUpdate={onElementUpdate}
                                    onDelete={onElementDelete}
                                    onEdit={onElementEdit}
                                    onSelect={onElementSelect}
                                    scale={scale}
                                />
                            ))}
                        {/* Drawing canvas overlay for the active tool */}
                        {activeTool && onAddDrawingElement && (
                            <DrawingCanvas
                                page={index + 1}
                                width={612}
                                height={792}
                                scale={scale}
                                activeTool={activeTool}
                                onAddElement={onAddDrawingElement}
                                brushStyle={brushStyle || 'regular'}
                                strokeColor={strokeColor || '#000000'}
                                fillColor={fillColor || 'transparent'}
                                strokeWidth={strokeWidth || 2}
                            />
                        )}
                    </div>
                ))}
            </Document>
        </div>
    );
}
