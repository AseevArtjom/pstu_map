import { useMemo } from 'react';

const hexToRgba = (hex: string, opacity: number) => {
    const cleanHex = (hex || '#2F80ED').replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const useBuildingColor = (hexColor: string | undefined | null) => {
    const color = hexColor || '#2F80ED';

    return useMemo(() => ({
        stroke: color,
        fill: hexToRgba(color, 0.2),
        circleFill: hexToRgba(color, 0.6),
        draggedCircleFill: color,
    }), [color]);
};