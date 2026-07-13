import { useState, useCallback } from 'react';

export interface GraphPoint {
    id: string;
    x: number;
    y: number;
}

export function useGraphConstructor(mapContainerRef: React.RefObject<HTMLDivElement | null>) {
    const [isGraphMode, setIsGraphMode] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

    const getSVGCoordinates = useCallback((clientX: number, clientY: number) => {
        if (!mapContainerRef.current) return { x: 0, y: 0 };

        const svgElement = mapContainerRef.current.querySelector('svg');
        if (!svgElement) return { x: 0, y: 0 };
        const targetGroup = svgElement.querySelector('g') || svgElement;

        const pt = svgElement.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;

        const svgP = pt.matrixTransform(targetGroup.getScreenCTM()?.inverse());
        return { x: Math.round(svgP.x), y: Math.round(svgP.y) };
    }, [mapContainerRef]);

    const handleMapDoubleClick = useCallback((
        event: React.MouseEvent,
        onCreateNode: (x: number, y: number) => void
    ) => {
        if (!isGraphMode) return;
        const target = event.target as HTMLElement;
        if (target.closest('[data-node-id]')) return;

        const pos = getSVGCoordinates(event.clientX, event.clientY);
        onCreateNode(pos.x, pos.y);
    }, [isGraphMode, getSVGCoordinates]);

    const handleNodeClick = useCallback((
        nodeId: string,
        onCreateEdge: (fromId: string, toId: string) => void
    ) => {
        if (!isGraphMode) return;

        if (selectedNodeId === null) {
            setSelectedNodeId(nodeId);
        } else if (selectedNodeId === nodeId) {
            setSelectedNodeId(null);
        } else {
            onCreateEdge(selectedNodeId, nodeId);
            setSelectedNodeId(null);
        }
    }, [isGraphMode, selectedNodeId]);

    const handleNodeDrag = useCallback((event: React.MouseEvent) => {
        if (!draggedNodeId) return null;
        return getSVGCoordinates(event.clientX, event.clientY);
    }, [draggedNodeId, getSVGCoordinates]);

    return {
        isGraphMode, setIsGraphMode,
        selectedNodeId, setSelectedNodeId,
        draggedNodeId, setDraggedNodeId,
        handleMapDoubleClick, handleNodeClick, handleNodeDrag,
        getSVGCoordinates,
    };
}