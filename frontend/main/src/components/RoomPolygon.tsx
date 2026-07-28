import { useMemo } from "react";
import type { Room } from "@shared/types/Room.ts";
import { hexToRgba } from "../hooks/useDrawingColor.ts";
import EntityIcon from "./EntityIcon.tsx";
import EntityPolygon from "./EntityPolygon.tsx";

interface RoomPolygonProps {
    room: Room;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick?: () => void;
}

export interface SVGPoint {
    x: number;
    y: number;
}

function getCentroid(points: { x: number; y: number }[]) {
    if (points.length === 0) return { x: 0, y: 0 };
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
}

export const parsePoints = (pointsStr: string): SVGPoint[] => {
    if (!pointsStr) return [];
    return pointsStr.split(' ').map(p => {
        const [x, y] = p.split(',');
        return { x: Number(x), y: Number(y) };
    });
};

export const formatPoints = (points: SVGPoint[]): string => {
    return points.map(p => `${p.x},${p.y}`).join(' ');
};

function getBoundingBox(points: { x: number; y: number }[]) {
    if (points.length === 0) return { width: 0, height: 0 };
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
    };
}

let measureCanvas: HTMLCanvasElement | null = null;
function measureTextWidth(text: string, font: string): number {
    if (!measureCanvas) measureCanvas = document.createElement("canvas");
    const ctx = measureCanvas.getContext("2d");
    if (!ctx) return text.length * 6;
    ctx.font = font;
    return ctx.measureText(text).width;
}

const MAX_LABEL_WIDTH = 80;
const MIN_LABEL_WIDTH = 30;
const HORIZONTAL_PADDING = 10;
const ICON_SIZE = 12;
const ICON_TEXT_GAP = 4;

const LABEL_FIT_MARGIN = 3;
const LABEL_MIN_HEIGHT = 22;
const ICON_ONLY_MARGIN = 4;

export default function RoomPolygon({ room, isHovered, onMouseEnter, onMouseLeave, onClick }: RoomPolygonProps) {
    const points = room.roomPolygon ? parsePoints(room.roomPolygon) : [];
    const { x, y } = getCentroid(points);
    const bbox = useMemo(() => getBoundingBox(points), [points]);
    const effectiveColor = room.customColor || room.roomType?.defaultColor || "#00B074";
    const iconPath = room.customIconPath || room.roomType?.defaultIconPath || null;
    const shadowId = `label-shadow-${room.id}`;

    const iconReservedWidth = iconPath ? ICON_SIZE + ICON_TEXT_GAP : 0;

    const { displayName, labelWidth } = useMemo(() => {
        const font = "700 10px Arial, sans-serif";
        const maxTextWidth = MAX_LABEL_WIDTH - HORIZONTAL_PADDING * 2 - iconReservedWidth;
        const fullTextWidth = measureTextWidth(room.name, font);
        const fullLabelWidth = fullTextWidth + HORIZONTAL_PADDING * 2 + iconReservedWidth;

        if (fullLabelWidth <= MAX_LABEL_WIDTH) {
            return { displayName: room.name, labelWidth: Math.max(MIN_LABEL_WIDTH, fullLabelWidth) };
        }

        let truncated = room.name;
        while (truncated.length > 1) {
            truncated = truncated.slice(0, -1);
            const candidate = truncated + "…";
            if (measureTextWidth(candidate, font) <= maxTextWidth) {
                return { displayName: candidate, labelWidth: MAX_LABEL_WIDTH };
            }
        }
        return { displayName: room.name[0] + "…", labelWidth: MAX_LABEL_WIDTH };
    }, [room.name, iconReservedWidth]);

    if (!room.roomPolygon) return null;

    const textOffsetX = iconReservedWidth / 2;
    const iconOffsetX = -labelWidth / 2 + HORIZONTAL_PADDING / 0.9;

    const canFitFullLabel = bbox.width >= labelWidth + LABEL_FIT_MARGIN && bbox.height >= LABEL_MIN_HEIGHT;
    const canFitIconOnly = !canFitFullLabel && iconPath && bbox.width >= ICON_SIZE + ICON_ONLY_MARGIN && bbox.height >= ICON_SIZE + ICON_ONLY_MARGIN;

    return (
        <EntityPolygon
            id={room.id}
            dataAttribute="data-room-id"
            points={room.roomPolygon}
            color={effectiveColor}
            isHovered={isHovered}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            label={
                <g transform={`translate(${x}, ${y})`}>
                    <defs>
                        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.35" />
                        </filter>
                    </defs>

                    {canFitFullLabel && (
                        <>
                            <rect
                                x={-labelWidth / 2} y={-11} width={labelWidth} height={22} rx="5"
                                fill={hexToRgba(effectiveColor, 0.4)}
                                stroke={isHovered ? effectiveColor : hexToRgba(effectiveColor, 0.6)}
                                strokeWidth={isHovered ? "1.5" : "1"}
                                style={{ transition: "all 0.15s ease-in-out", pointerEvents: "none" }}
                            />
                            {iconPath && (
                                <foreignObject
                                    x={iconOffsetX} y={-ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE}
                                    style={{ pointerEvents: "none", overflow: "visible" }}
                                    filter={`url(#${shadowId})`}
                                >
                                    <EntityIcon iconPath={iconPath} iconColor={effectiveColor} size={ICON_SIZE} />
                                </foreignObject>
                            )}
                            <text
                                x={textOffsetX} y={1.5} textAnchor="middle" dominantBaseline="middle"
                                fontSize="10" fontWeight="700" fill={effectiveColor} filter={`url(#${shadowId})`}
                                style={{ userSelect: "none", pointerEvents: "none" }}
                            >
                                {displayName}
                            </text>
                        </>
                    )}

                    {canFitIconOnly && (
                        <foreignObject
                            x={-ICON_SIZE / 2} y={-ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE}
                            style={{ pointerEvents: "none", overflow: "visible" }}
                            filter={`url(#${shadowId})`}
                        >
                            <EntityIcon iconPath={iconPath!} iconColor={effectiveColor} size={ICON_SIZE} />
                        </foreignObject>
                    )}
                </g>
            }
        />
    );
}