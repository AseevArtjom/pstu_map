import type { SVGPoint } from "../../hooks/usePolygonConstructor.ts";
import { useDrawingColor } from "../../hooks/useDrawingColor.ts";

interface DrawingLayerProps {
    polygonPoints: SVGPoint[];
    tempPoint: SVGPoint | null;
    draggedPointIndex: number | null;
    onPointMouseDown: (index: number, event: React.MouseEvent) => void;
    onPointContextMenu: (index: number, event: React.MouseEvent) => void;
    fillColor?: string;
}

export default function PolygonDrawingLayer({
                                                polygonPoints,
                                                tempPoint,
                                                draggedPointIndex,
                                                onPointMouseDown,
                                                onPointContextMenu,
                                                fillColor
                                            }: DrawingLayerProps) {
    if (polygonPoints.length === 0) return null;

    const pointsString = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');
    const tempPointsString = tempPoint
        ? `${pointsString} ${tempPoint.x},${tempPoint.y}`
        : pointsString;

    const firstPoint = polygonPoints[0];
    const lastPoint = polygonPoints[polygonPoints.length - 1];

    const isShowingLines = draggedPointIndex === null && tempPoint !== null;

    const colors = useDrawingColor(fillColor);

    return (
        <g style={{ zIndex: 9999 }}>
            {isShowingLines && polygonPoints.length >= 2 && (
                <polygon
                    points={tempPointsString}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="1"
                    opacity={0.5}
                />
            )}

            {polygonPoints.length >= 3 && (
                <polygon
                    className="stable-polygon"
                    points={pointsString}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="2"
                />
            )}

            {polygonPoints.length > 0 && polygonPoints.length < 3 && (
                <polyline
                    className="stable-polyline"
                    points={pointsString}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2"
                />
            )}

            {isShowingLines && tempPoint && (
                <>
                    <line
                        x1={lastPoint.x} y1={lastPoint.y}
                        x2={tempPoint.x} y2={tempPoint.y}
                        stroke={colors.stroke} strokeWidth="2" strokeDasharray="4 4"
                    />
                    {polygonPoints.length >= 2 && (
                        <line
                            x1={firstPoint.x} y1={firstPoint.y}
                            x2={tempPoint.x} y2={tempPoint.y}
                            stroke={colors.stroke} strokeWidth="2" strokeDasharray="4 4"
                        />
                    )}
                </>
            )}

            {polygonPoints.map((point, index) => (
                <circle
                    key={index}
                    cx={point.x} cy={point.y}
                    r={draggedPointIndex === index ? 5 : 3.5}
                    fill={draggedPointIndex === index ? colors.draggedCircleFill : colors.circleFill}
                    stroke="rgba(255, 255, 255, 0.8)"
                    strokeWidth="1.5"
                    style={{
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        transition: 'r 0.15s ease'
                    }}
                    onMouseDown={(e) => onPointMouseDown(index, e)}
                    onContextMenu={(e) => onPointContextMenu(index, e)}
                />
            ))}
        </g>
    );
}