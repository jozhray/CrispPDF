import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { PDFElement } from './types';

export async function loadPDF(file: File): Promise<Uint8Array> {
    return new Uint8Array(await file.arrayBuffer());
}

export async function createPDF(file: File): Promise<PDFDocument> {
    const arrayBuffer = await file.arrayBuffer();
    return await PDFDocument.load(arrayBuffer);
}

export function blobToURL(blob: Blob): string {
    return URL.createObjectURL(blob);
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const values = result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
    return rgb(values.r, values.g, values.b);
}

export async function savePDF(file: File, elements: PDFElement[]): Promise<Uint8Array> {
    const pdfDoc = await createPDF(file);
    const pages = pdfDoc.getPages();

    // Embed standard fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    for (const element of elements) {
        const pageIndex = element.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height } = page.getSize();

        // Convert coordinates: Web (top-left) to PDF (bottom-left)
        const pdfX = element.x;
        // Adjust Y for text elements based on font size (approximate baseline adjustment)
        const pdfY = height - element.y - (element.type === 'text' || element.type === 'date' ? (element.fontSize || 16) * 0.8 : element.height);

        if (element.type === 'text' || element.type === 'date') {
            let font: PDFFont = helveticaFont;
            if (element.fontWeight === 'bold' && element.fontStyle === 'italic') {
                font = helveticaBoldOblique;
            } else if (element.fontWeight === 'bold') {
                font = helveticaBold;
            } else if (element.fontStyle === 'italic') {
                font = helveticaOblique;
            }

            page.drawText(element.content || '', {
                x: pdfX,
                y: pdfY,
                size: element.fontSize || 16,
                font: font,
                color: hexToRgb(element.color || '#000000'),
            });
        } else if (element.type === 'signature' && element.content) {
            const pngImage = await pdfDoc.embedPng(element.content);
            page.drawImage(pngImage, {
                x: pdfX,
                y: pdfY,
                width: element.width,
                height: element.height,
            });
        } else if (element.type === 'rect') {
            page.drawRectangle({
                x: pdfX,
                y: height - element.y - element.height, // PDF coords are bottom-left
                width: element.width,
                height: element.height,
                borderColor: hexToRgb(element.strokeColor || '#000000'),
                borderWidth: element.strokeWidth || 1,
                color: element.fillColor && element.fillColor !== 'transparent' ? hexToRgb(element.fillColor) : undefined,
            });
        } else if (element.type === 'circle') {
            page.drawEllipse({
                x: pdfX + element.width / 2,
                y: height - element.y - element.height / 2,
                xScale: element.width / 2,
                yScale: element.height / 2,
                borderColor: hexToRgb(element.strokeColor || '#000000'),
                borderWidth: element.strokeWidth || 1,
                color: element.fillColor && element.fillColor !== 'transparent' ? hexToRgb(element.fillColor) : undefined,
            });
        } else if (element.type === 'line' && element.points) {
            page.drawLine({
                start: { x: element.points[0], y: height - element.points[1] },
                end: { x: element.points[2], y: height - element.points[3] },
                thickness: element.strokeWidth || 1,
                color: hexToRgb(element.strokeColor || '#000000'),
            });
        } else if (element.type === 'path' && element.points) {
            // Drawing paths in pdf-lib is complex as it requires SVG path parsing or manual line drawing
            // For MVP, we'll approximate with lines connecting points
            const points = element.points;
            for (let i = 0; i < points.length - 2; i += 2) {
                page.drawLine({
                    start: { x: points[i], y: height - points[i + 1] },
                    end: { x: points[i + 2], y: height - points[i + 3] },
                    thickness: element.strokeWidth || 1,
                    color: hexToRgb(element.strokeColor || '#000000'),
                });
            }
        }
    }

    return await pdfDoc.save();
}
