import { useState, useEffect, useCallback, useRef } from 'react';
import {useAppDispatch} from "../store/store.ts";
import {createBuilding} from "../store/buildingSlice.ts";

export interface SVGPoint {
    x: number;
    y: number;
}

interface ContextMenuState {
    mouseX: number | null;
    mouseY: number | null;
    targetType: 'map' | 'building' | null;
    targetId?: number;
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

export function useBuildingConstructor(currentMapSize: { width: number; height: number }, selectedBuilding: number | null) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const activeCoordsRef = useRef<SVGPoint | null>(null);

    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ mouseX: null, mouseY: null, targetType: null });
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [polygonPoints, setPolygonPoints] = useState<SVGPoint[]>([]);
    const [tempPoint, setTempPoint] = useState<SVGPoint | null>(null);
    const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const dispatch = useAppDispatch();

    const setPointsFromExternal = useCallback((points: SVGPoint[], id: number) => {
        setPolygonPoints(points);
        setEditingId(id);
        setIsDrawingMode(true);
        setIsEditing(true);
    }, []);



    const getSVGCoordinates = useCallback((clientX: number, clientY: number): SVGPoint => {
        if (!mapContainerRef.current) return { x: 0, y: 0 };

        const svgElement = mapContainerRef.current.querySelector('svg');
        if (!svgElement) return { x: 0, y: 0 };

        const rect = svgElement.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;

        const svgWidth = Number(svgElement.getAttribute('width')) || currentMapSize.width + 240;
        const svgHeight = Number(svgElement.getAttribute('height')) || currentMapSize.height + 240;

        const scaleX = svgWidth / rect.width;
        const scaleY = svgHeight / rect.height;

        const svgX = relativeX * scaleX;
        const svgY = relativeY * scaleY;

        return {
            x: Math.round(svgX - 120),
            y: Math.round(svgY - 120)
        };
    }, [currentMapSize]);

    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        if (isDrawingMode) return;
        event.preventDefault();

        const target = event.target as HTMLElement;
        const buildingIdAttr = target.getAttribute('data-building-id');

        if (buildingIdAttr) {
            setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, targetType: 'building', targetId: Number(buildingIdAttr) });
        } else if (selectedBuilding === null) {
            setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, targetType: 'map' });
        }
    }, [isDrawingMode, selectedBuilding]);

    const handleCloseContextMenu = useCallback(() => {
        setContextMenu({ mouseX: null, mouseY: null, targetType: null });
    }, []);

    const startDrawingMode = useCallback(() => {
        setIsDrawingMode(true);
        setPolygonPoints([]);
        setTempPoint(null);

        if (contextMenu.mouseX !== null && contextMenu.mouseY !== null) {
            const startPoint = getSVGCoordinates(contextMenu.mouseX, contextMenu.mouseY);
            setPolygonPoints([startPoint]);
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

        const newPoint = getSVGCoordinates(event.clientX, event.clientY);
        setPolygonPoints((prev) => [...prev, newPoint]);
    }, [isDrawingMode, getSVGCoordinates]);

    const handleMapMouseMove = useCallback((event: React.MouseEvent) => {
        if (!isDrawingMode) return;

        const currentMousePos = getSVGCoordinates(event.clientX, event.clientY);

        if (draggedPointIndex !== null) {
            setPolygonPoints((prev) =>
                prev.map((p, idx) => (idx === draggedPointIndex ? currentMousePos : p))
            );
        } else if (polygonPoints.length > 0) {
            setTempPoint(currentMousePos);
        }
    }, [isDrawingMode, draggedPointIndex, polygonPoints, getSVGCoordinates]);

    const handlePointContextMenu = useCallback((index: number, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        setPolygonPoints((prev) => {
            const updated = prev.filter((_, idx) => idx !== index);
            if (updated.length === 0) {
                setTempPoint(null);
            }
            return updated;
        });
    }, []);

    const handlePointMouseDown = useCallback((index: number, event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        setDraggedPointIndex(index);
    }, []);

    const handleMapMouseUp = useCallback(() => {
        if (draggedPointIndex !== null && activeCoordsRef.current) {
            const finalPos = activeCoordsRef.current;
            setPolygonPoints((prev) =>
                prev.map((point, idx) => idx === draggedPointIndex ? finalPos : point)
            );
        }
        setDraggedPointIndex(null);
        activeCoordsRef.current = null;
    }, [draggedPointIndex]);

    const handleSaveBuilding = useCallback((
        name: string,
        hexColor: string,
        iconPath: string | null,
        lengthM: number,
        depthM: number
    ) => {
        const pointsStr = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');

        const payload = {
            name,
            mapPolygon: pointsStr,
            hex_color: hexColor,
            icon_path: iconPath,
            lengthM,
            depthM
        };

        dispatch(createBuilding(payload));
        resetDrawing();
    }, [polygonPoints, resetDrawing, dispatch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isDrawingMode || isSaveModalOpen) return;
            if (e.key === 'Escape') resetDrawing();
            if (e.key === 'Enter') {
                if (polygonPoints.length < 3) {
                    console.warn("Нужно минимум 3 точки для фиксации здания!");
                    return;
                }
                setIsSaveModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDrawingMode, polygonPoints, isSaveModalOpen, resetDrawing]);

    const pointsString = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');
    const tempPointsString = tempPoint && draggedPointIndex === null
        ? `${pointsString} ${tempPoint.x},${tempPoint.y}`
        : pointsString;

    return {
        mapContainerRef,
        contextMenu,
        isDrawingMode,
        isSaveModalOpen,
        setIsSaveModalOpen,
        polygonPoints,
        tempPoint,
        pointsString,
        tempPointsString,
        draggedPointIndex,
        handleContextMenu,
        handleCloseContextMenu,
        startDrawingMode,
        handleMapDoubleClick,
        handleMapMouseMove,
        handlePointMouseDown,
        handleMapMouseUp,
        handlePointContextMenu,
        handleSaveBuilding,
        isEditing,
        editingId,
        setPointsFromExternal,
        resetDrawing
    };
}