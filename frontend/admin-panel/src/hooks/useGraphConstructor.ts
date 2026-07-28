import { useState, useCallback, useRef } from 'react';
import type {EdgeType} from "@shared/types/EdgeType.ts";

export interface SVGPoint {
    x: number;
    y: number;
}

interface NodePosition {
    x: number;
    y: number;
    floor?: number;
}
export const calculateEdgeWeight = (
    fromNode: NodePosition,
    toNode: NodePosition,
    type: EdgeType | string = 'corridor'
): number => {
    if (type === 'outdoor') {
        const dist = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);
        return Math.max(1, Math.round(dist));
    }
    if (type === 'stairs' || type === 'elevator') {
        const floorDiff = Math.abs((fromNode.floor ?? 0) - (toNode.floor ?? 0)) || 1;

        const basePenalty = type === 'elevator' ? 15 : 280;
        return basePenalty * floorDiff;
    }

    const distance = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);
    return Math.max(1, Math.round(distance));
};

const snapToAxis = (reference: { x: number; y: number }, point: { x: number; y: number }) => {
    const dx = Math.abs(point.x - reference.x);
    const dy = Math.abs(point.y - reference.y);
    return dx >= dy
        ? { x: point.x, y: reference.y }
        : { x: reference.x, y: point.y };
};

export function useGraphConstructor(mapContainerRef: React.RefObject<HTMLDivElement | null>) {
    const [isGraphMode, setIsGraphMode] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

    const lastPlacedPosRef = useRef<{ x: number; y: number } | null>(null);

    const getSVGCoordinates = useCallback((clientX: number, clientY: number): SVGPoint => {
        if (!mapContainerRef.current) return { x: 0, y: 0 };

        const targetLayer = mapContainerRef.current.querySelector('#map-content-layer') as SVGGraphicsElement | null;

        const svgElement = targetLayer?.ownerSVGElement
            || mapContainerRef.current.querySelector('svg:not(.MuiSvgIcon-root)');

        if (!svgElement) return { x: 0, y: 0 };

        const activeElement = targetLayer || svgElement;
        const ctm = activeElement.getScreenCTM();

        if (!ctm) return { x: 0, y: 0 };

        const pt = svgElement.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;

        const localPt = pt.matrixTransform(ctm.inverse());

        return {
            x: Math.round(localPt.x),
            y: Math.round(localPt.y)
        };
    }, [mapContainerRef]);

    const buildEdgePayload = useCallback((
        fromNode: NodePosition & { id: string },
        toNode: NodePosition & { id: string },
        type: EdgeType | string = 'corridor'
    ) => {
        const weight = calculateEdgeWeight(fromNode, toNode, type);
        return {
            fromNodeId: fromNode.id,
            toNodeId: toNode.id,
            weight,
            type,
        };
    }, []);

    const handleMapDoubleClick = useCallback((
        event: React.MouseEvent,
        onCreateNode: (x: number, y: number) => void
    ) => {
        if (!isGraphMode) return;
        const target = event.target as HTMLElement;
        if (target.closest('[data-node-id]')) return;

        const rawPos = getSVGCoordinates(event.clientX, event.clientY);
        const pos = event.shiftKey && lastPlacedPosRef.current
            ? snapToAxis(lastPlacedPosRef.current, rawPos)
            : rawPos;

        lastPlacedPosRef.current = pos;
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

    const handleNodeDrag = useCallback((
        event: React.MouseEvent,
        referencePoint?: { x: number; y: number }
    ) => {
        if (!draggedNodeId) return null;
        const rawPos = getSVGCoordinates(event.clientX, event.clientY);

        if (event.shiftKey && referencePoint) {
            return snapToAxis(referencePoint, rawPos);
        }
        return rawPos;
    }, [draggedNodeId, getSVGCoordinates]);

    return {
        isGraphMode, setIsGraphMode,
        selectedNodeId, setSelectedNodeId,
        draggedNodeId, setDraggedNodeId,
        handleMapDoubleClick, handleNodeClick, handleNodeDrag,
        buildEdgePayload,
        calculateEdgeWeight,
        getSVGCoordinates,
    };
}