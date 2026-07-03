import type { SVGPoint } from "../hooks/useBuildingConstructor";

interface DrawingLayerProps {
    mapSize: { width: number; height: number };
    polygonPoints: SVGPoint[];
    tempPointsString: string;
    tempPoint: SVGPoint | null;
    draggedPointIndex: number | null;
    onPointMouseDown: (index: number, event: React.MouseEvent) => void;
    onPointContextMenu: (index: number, event: React.MouseEvent) => void;
}

export default function BuildingDrawingLayer({
                                                 polygonPoints,
                                                 tempPointsString,
                                                 tempPoint,
                                                 draggedPointIndex,
                                                 onPointMouseDown,
                                                 onPointContextMenu
                                             }: DrawingLayerProps) {
    if (polygonPoints.length === 0) return null;

    const pointsString = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');
    const firstPoint = polygonPoints[0];
    const lastPoint = polygonPoints[polygonPoints.length - 1];

    const isShowingLines = draggedPointIndex === null && tempPoint !== null;

    return (
        <g style={{ zIndex: 9999 }}>
            {polygonPoints.length >= 2 && isShowingLines && (
                <polygon
                    points={tempPointsString}
                    fill="rgba(47, 128, 237, 0.15)"
                    stroke="none"
                />
            )}

            {polygonPoints.length >= 3 && (
                <polygon
                    className="stable-polygon"
                    points={pointsString}
                    fill="rgba(47, 128, 237, 0.2)"
                    stroke="rgba(47, 128, 237, 0.7)"
                    strokeWidth="2"
                />
            )}

            {polygonPoints.length < 3 && (
                <polyline
                    className="stable-polyline"
                    points={pointsString}
                    fill="none"
                    stroke="rgba(47, 128, 237, 0.7)"
                    strokeWidth="2"
                />
            )}

            {isShowingLines && tempPoint && (
                <>
                    <line
                        x1={lastPoint.x}
                        y1={lastPoint.y}
                        x2={tempPoint.x}
                        y2={tempPoint.y}
                        stroke="rgba(47, 128, 237, 0.7)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                    />
                    {polygonPoints.length >= 2 && (
                        <line
                            x1={firstPoint.x}
                            y1={firstPoint.y}
                            x2={tempPoint.x}
                            y2={tempPoint.y}
                            stroke="rgba(47, 128, 237, 0.7)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />
                    )}
                </>
            )}

            {polygonPoints.map((point, index) => {
                const isDragged = draggedPointIndex === index;

                return (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={isDragged ? 4.5 : 3.5}
                        className="drawing-circle"
                        data-index={index}
                        fill={isDragged ? "rgba(21, 101, 192, 0.85)" : "rgba(47, 128, 237, 0.6)"}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))',
                            transition: 'transform 0.1s ease, r 0.15s ease'
                        }}
                        onMouseDown={(e) => onPointMouseDown(index, e)}
                        onContextMenu={(e) => onPointContextMenu(index, e)}
                    />
                );
            })}
        </g>
    );
}