import { useState, useCallback, useRef, useEffect } from 'react';

export interface SVGPoint {
    x: number;
    y: number;
}

export interface ContextMenuState<TId = number> {
    mouseX: number | null;
    mouseY: number | null;
    targetType: 'map' | 'item' | null;
    targetId?: TId;
}

export const parsePoints = (pointsStr: string): SVGPoint[] => {
    return pointsStr.split(' ').map(p => {
        const [x, y] = p.split(',');
        return { x: Number(x), y: Number(y) };
    });
};

export const formatPoints = (points: SVGPoint[]): string => {
    return points.map(p => `${p.x},${p.y}`).join(' ');
};

const snapToAxis = (reference: SVGPoint, point: SVGPoint): SVGPoint => {
    const dx = Math.abs(point.x - reference.x);
    const dy = Math.abs(point.y - reference.y);
    return dx >= dy
        ? { x: point.x, y: reference.y }
        : { x: reference.x, y: point.y };
};

export function usePolygonConstructor<TId extends string | number = number>(
    dataAttributeName: string,
    onSave: (polygon: string, id: TId | null) => void,
    parseId: (raw: string) => TId = (raw) => raw as unknown as TId
) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState<TId>>({ mouseX: null, mouseY: null, targetType: null });
    const [editingId, setEditingId] = useState<TId | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [polygonPoints, setPolygonPoints] = useState<SVGPoint[]>([]);
    const [tempPoint, setTempPoint] = useState<SVGPoint | null>(null);
    const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const getSVGCoordinates = useCallback((clientX: number, clientY: number): SVGPoint => {
        if (!mapContainerRef.current) return { x: 0, y: 0 };
        const svgElement = mapContainerRef.current.querySelector('svg');

        if (!svgElement) return { x: 0, y: 0 };
        const pt = svgElement.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;

        const svgP = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());

        return {
            x: Math.round(svgP.x - 120),
            y: Math.round(svgP.y - 120)
        };
    }, []);

    const handleMapMouseUp = useCallback(() => {
        setDraggedPointIndex(null);
    }, []);

    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        if (isDrawingMode) return;
        event.preventDefault();

        const target = event.target as HTMLElement;
        const idAttr = target.closest(`[${dataAttributeName}]`)?.getAttribute(dataAttributeName);

        if (idAttr) {
            setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, targetType: 'item', targetId: parseId(idAttr) });
        } else {
            setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, targetType: 'map' });
        }
    }, [isDrawingMode, dataAttributeName, parseId]);

    const handleCloseContextMenu = useCallback(() => {
        setContextMenu({ mouseX: null, mouseY: null, targetType: null });
    }, []);

    const startDrawingMode = useCallback(() => {
        setIsDrawingMode(true);
        setPolygonPoints([]);
        setTempPoint(null);
        if (contextMenu.mouseX !== null && contextMenu.mouseY !== null) {
            setPolygonPoints([getSVGCoordinates(contextMenu.mouseX, contextMenu.mouseY)]);
        }
    }, [contextMenu, getSVGCoordinates]);

    const resetDrawing = useCallback(() => {
        setIsDrawingMode(false);
        setIsEditing(false);
        setEditingId(null);
        setPolygonPoints([]);
        setTempPoint(null);
        setDraggedPointIndex(null);
        setIsSaveModalOpen(false);
    }, []);

    const handleMapDoubleClick = useCallback((event: React.MouseEvent) => {
        if (!isDrawingMode) return;
        event.stopPropagation();

        setPolygonPoints((prev) => {
            const rawPos = getSVGCoordinates(event.clientX, event.clientY);
            const lastPoint = prev[prev.length - 1];
            const pos = event.shiftKey && lastPoint ? snapToAxis(lastPoint, rawPos) : rawPos;
            return [...prev, pos];
        });
    }, [isDrawingMode, getSVGCoordinates]);

    const handleMapMouseMove = useCallback((event: React.MouseEvent) => {
        if (!isDrawingMode) return;
        const rawPos = getSVGCoordinates(event.clientX, event.clientY);

        if (draggedPointIndex !== null) {
            setPolygonPoints((prev) => {
                const neighborIndex = draggedPointIndex > 0 ? draggedPointIndex - 1 : prev.length - 1;
                const neighbor = prev.length > 1 ? prev[neighborIndex] : null;
                const pos = event.shiftKey && neighbor && neighborIndex !== draggedPointIndex
                    ? snapToAxis(neighbor, rawPos)
                    : rawPos;
                return prev.map((p, idx) => (idx === draggedPointIndex ? pos : p));
            });
        } else if (polygonPoints.length > 0) {
            const lastPoint = polygonPoints[polygonPoints.length - 1];
            const pos = event.shiftKey ? snapToAxis(lastPoint, rawPos) : rawPos;
            setTempPoint(pos);
        }
    }, [isDrawingMode, draggedPointIndex, polygonPoints, getSVGCoordinates]);

    const handlePointContextMenu = useCallback((index: number, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setPolygonPoints((prev) => {
            const updated = prev.filter((_, idx) => idx !== index);
            if (updated.length === 0) setTempPoint(null);
            return updated;
        });
    }, []);

    const handlePointMouseDown = useCallback((index: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setDraggedPointIndex(index);
    }, []);

    const finalizeDrawing = useCallback(() => {
        const pointsStr = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');
        onSave(pointsStr, editingId);
        resetDrawing();
    }, [polygonPoints, editingId, onSave, resetDrawing]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isDrawingMode || isSaveModalOpen) return;
            if (e.key === 'Escape') resetDrawing();
            if (e.key === 'Enter') {
                if (polygonPoints.length < 3) return;
                setIsSaveModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDrawingMode, polygonPoints, isSaveModalOpen, resetDrawing]);

    return {
        mapContainerRef, contextMenu, isDrawingMode, isSaveModalOpen, setIsSaveModalOpen,
        polygonPoints, setPolygonPoints, tempPoint, setDraggedPointIndex, draggedPointIndex,
        handleContextMenu, handleCloseContextMenu, startDrawingMode, handleMapDoubleClick,
        handleMapMouseMove, handlePointMouseDown, handlePointContextMenu, finalizeDrawing,
        isEditing, editingId, setEditingId, setIsEditing, setIsDrawingMode, resetDrawing, handleMapMouseUp
    };
}