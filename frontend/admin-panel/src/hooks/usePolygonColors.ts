import { useMemo } from 'react';

export function usePolygonColors(hexColor: string | undefined, isHovered: boolean) {
    return useMemo(() => {
        const baseHex = hexColor && hexColor.length === 7 ? hexColor : '#2F80ED';

        const r = parseInt(baseHex.slice(1, 3), 16);
        const g = parseInt(baseHex.slice(3, 5), 16);
        const b = parseInt(baseHex.slice(5, 7), 16);

        const alpha = isHovered ? 0.3 : 0.12;

        return {
            fill: `rgba(${r}, ${g}, ${b}, ${alpha})`,
            stroke: baseHex
        };
    }, [hexColor, isHovered]);
}