// Helper functions to generate SVG paths for shapes

export function getShapePath(shape: string, width: number, height: number): string {
    const w = width;
    const h = height;
    const cx = w / 2;
    const cy = h / 2;

    switch (shape) {
        case 'triangle':
            return `M ${cx} 0 L ${w} ${h} L 0 ${h} Z`;

        case 'arrow':
            // Right-pointing arrow
            const ah = h / 3;
            return `M 0 ${ah} L ${w * 0.7} ${ah} L ${w * 0.7} 0 L ${w} ${cy} L ${w * 0.7} ${h} L ${w * 0.7} ${h - ah} L 0 ${h - ah} Z`;

        case 'diamond':
            return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`;

        case 'pentagon':
            const pentagonPoints = [];
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                const x = cx + cx * Math.cos(angle);
                const y = cy + cy * Math.sin(angle);
                pentagonPoints.push(`${x} ${y}`);
            }
            return `M ${pentagonPoints.join(' L ')} Z`;

        case 'hexagon':
            const hexagonPoints = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * 2 * Math.PI) / 6;
                const x = cx + cx * Math.cos(angle);
                const y = cy + cy * Math.sin(angle);
                hexagonPoints.push(`${x} ${y}`);
            }
            return `M ${hexagonPoints.join(' L ')} Z`;

        case 'star':
            const starPoints = [];
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const radius = i % 2 === 0 ? cx : cx * 0.4;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                starPoints.push(`${x} ${y}`);
            }
            return `M ${starPoints.join(' L ')} Z`;

        case 'heart':
            const heartPath = `
        M ${cx} ${h * 0.3}
        C ${cx} ${h * 0.15}, ${w * 0.65} 0, ${w * 0.75} ${h * 0.2}
        C ${w * 0.9} ${h * 0.35}, ${w * 0.9} ${h * 0.55}, ${cx} ${h}
        C ${w * 0.1} ${h * 0.55}, ${w * 0.1} ${h * 0.35}, ${w * 0.25} ${h * 0.2}
        C ${w * 0.35} 0, ${cx} ${h * 0.15}, ${cx} ${h * 0.3}
        Z
      `;
            return heartPath.trim().replace(/\s+/g, ' ');

        default:
            return '';
    }
}
