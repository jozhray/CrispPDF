'use client';

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Make sure worker is set up
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFThumbnailProps {
    file: File;
    pageNumber: number;
    scale?: number;
}

export function PDFThumbnail({ file, pageNumber, scale = 0.2 }: PDFThumbnailProps) {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg">
            <Document file={file}>
                <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-sm"
                />
            </Document>
        </div>
    );
}
