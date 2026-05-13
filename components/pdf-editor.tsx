'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PDFUploader } from './pdf-uploader';
const PDFViewer = dynamic(() => import('./pdf-viewer').then(mod => mod.PDFViewer), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading PDF Viewer...</div>
});
import { Toolbar } from './toolbar';
import { SignatureModal } from './signature-modal';
import { StyleToolbar } from './style-toolbar';
import { PDFElement, ElementType, BrushStyle } from '@/lib/types';
import { savePDF } from '@/lib/pdf-utils';

export function PDFEditor() {
    const [file, setFile] = useState<File | null>(null);
    const [elements, setElements] = useState<PDFElement[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [editingSignatureId, setEditingSignatureId] = useState<string | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const [activeTool, setActiveTool] = useState<ElementType | null>(null);
    const [brushStyle, setBrushStyle] = useState<BrushStyle>('regular');
    const [fillColor, setFillColor] = useState('transparent');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [isEraserActive, setIsEraserActive] = useState(false);

    const handleAddElement = (type: ElementType) => {
        if (type === 'signature') {
            setEditingSignatureId(null);
            setIsSignatureModalOpen(true);
            return;
        }

        const newElement: PDFElement = {
            id: crypto.randomUUID(),
            type,
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            page: 1,
            content: type === 'text' ? 'Double click to edit' : type === 'date' ? new Date().toLocaleDateString() : '',
            fontSize: 16,
            color: '#000000',
        };

        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    };

    const handleAddDrawingElement = (element: PDFElement) => {
        setElements(prev => [...prev, element]);
        setSelectedElementId(element.id);
        setActiveTool(null);
    };

    const handleSaveSignature = (dataUrl: string) => {
        if (editingSignatureId) {
            setElements(prev => prev.map(el => el.id === editingSignatureId ? { ...el, content: dataUrl } : el));
        } else {
            const newElement: PDFElement = {
                id: crypto.randomUUID(),
                type: 'signature',
                x: 100,
                y: 100,
                width: 200,
                height: 100,
                page: 1,
                content: dataUrl,
            };
            setElements(prev => [...prev, newElement]);
        }
        setEditingSignatureId(null);
        setIsSignatureModalOpen(false);
    };

    const handleUpdateElement = (id: string, updates: Partial<PDFElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const handleDeleteElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElementId === id) {
            setSelectedElementId(null);
        }
    };

    const handleEditSignature = (id: string) => {
        setEditingSignatureId(id);
        setIsSignatureModalOpen(true);
    };

    const handleSelectElement = (id: string) => {
        // If eraser is active, delete the element
        if (isEraserActive) {
            handleDeleteElement(id);
            return;
        }

        const element = elements.find(el => el.id === id);
        if (element?.type === 'signature') {
            setEditingSignatureId(id);
            setIsSignatureModalOpen(true);
        } else {
            setSelectedElementId(id === selectedElementId ? null : id);
        }
    };

    const handleDownload = async () => {
        if (!file) return;
        setIsSaving(true);
        try {
            console.log('Starting PDF save...');
            const modifiedPdfBytes = await savePDF(file, elements);
            console.log('PDF saved, bytes:', modifiedPdfBytes.length);

            const blob = new Blob([modifiedPdfBytes as BlobPart], { type: 'application/pdf' });
            console.log('Blob created:', blob.size, 'bytes');

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Get original filename and ensure it has .pdf extension
            const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            link.download = `${originalName}_edited.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up after a delay to ensure download starts
            setTimeout(() => URL.revokeObjectURL(url), 100);

            console.log('PDF download initiated successfully');
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert(`Failed to save PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-transparent">

            <main className="flex-1 overflow-hidden relative flex flex-col" style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                {!file ? (
                    <div className="flex items-center justify-center h-full w-full p-8">
                        <div className="w-full max-w-xl">
                            <PDFUploader onFileSelect={setFile} />
                        </div>
                    </div>
                ) : (
                    <>
                        <Toolbar
                            onAddElement={handleAddElement}
                            activeTool={activeTool}
                            onSetTool={setActiveTool}
                            brushStyle={brushStyle}
                            onBrushStyleChange={setBrushStyle}
                            fillColor={fillColor}
                            onFillColorChange={setFillColor}
                            strokeColor={strokeColor}
                            onStrokeColorChange={setStrokeColor}
                            strokeWidth={strokeWidth}
                            onStrokeWidthChange={setStrokeWidth}
                            isEraserActive={isEraserActive}
                            onEraserToggle={() => setIsEraserActive(!isEraserActive)}
                            onSave={handleDownload}
                        />
                        <div className="flex-1 relative bg-black/5 backdrop-blur-[2px] overflow-hidden">
                            <PDFViewer
                                file={file}
                                elements={elements}
                                onElementUpdate={handleUpdateElement}
                                onElementDelete={handleDeleteElement}
                                onElementEdit={handleSelectElement}
                                onElementSelect={handleSelectElement}
                                activeTool={activeTool}
                                onAddDrawingElement={handleAddDrawingElement}
                                brushStyle={brushStyle}
                                strokeColor={strokeColor}
                                fillColor={fillColor}
                                strokeWidth={strokeWidth}
                            />
                            {selectedElementId && (
                                <StyleToolbar
                                    element={elements.find(el => el.id === selectedElementId) || null}
                                    onUpdate={(updates) => handleUpdateElement(selectedElementId, updates)}
                                />
                            )}
                        </div>
                    </>
                )}
            </main>
            <SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onSave={handleSaveSignature}
            />
        </div >
    );
}
