import { useState } from "react";
import type {Room} from "../types/Room.ts";
import {useAppSelector} from "../store/store.ts";


interface RoomLabelsProps {
    selectedFloor: number | null;
    onRoomClick?: (room: Room) => void;
    mapWidth?: number;
    mapHeight?: number;
}

export default function RoomLabels({
                                       selectedFloor,
                                       onRoomClick,
                                       mapWidth = 805,
                                       mapHeight = 780
                                   }: RoomLabelsProps) {
    const { rooms } = useAppSelector((state) => state.room);
    const { calculatedPath } = useAppSelector((state) => state.map);

    const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

    return (
        <>
            {calculatedPath.length > 0 &&
                calculatedPath.map((node, index) => {
                    if (index === 0) return null;
                    const prevNode = calculatedPath[index - 1];

                    if (node.floor === selectedFloor && prevNode.floor === selectedFloor) {
                        return (
                            <line
                                key={`route-edge-${index}`}
                                x1={prevNode.x * mapWidth}
                                y1={prevNode.y * mapHeight}
                                x2={node.x * mapWidth}
                                y2={node.y * mapHeight}
                                stroke="#2F80ED"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray="6,6"
                            />
                        );
                    }
                    return null;
                })}

            {rooms
                .filter((room) => room.floor === selectedFloor)
                .map((room) => {
                    if (!room.node) return null;

                    const x = room.node.x * mapWidth;
                    const y = room.node.y * mapHeight;
                    const isHovered = hoveredRoomId === room.id;

                    return (
                        <g
                            key={room.id}
                            transform={`translate(${x}, ${y})`}
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() => setHoveredRoomId(room.id)}
                            onMouseLeave={() => setHoveredRoomId(null)}
                            onClick={() => onRoomClick?.(room)}
                        >
                            <rect
                                x={-35}
                                y={-11}
                                width={70}
                                height={22}
                                rx="5"
                                fill={isHovered ? "rgba(0, 176, 116, 0.2)" : "rgba(255, 255, 255, 0.9)"}
                                stroke={isHovered ? "#00B074" : "rgba(0, 0, 0, 0.2)"}
                                strokeWidth={isHovered ? "1.5" : "1"}
                                style={{ transition: "all 0.15s ease-in-out" }}
                            />

                            <text
                                x={0}
                                y={0}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="10"
                                fontWeight="700"
                                fill={isHovered ? "#007A51" : "#2D3748"}
                                style={{ userSelect: "none", pointerEvents: "none" }}
                            >
                                {room.name.length > 10 ? room.name.substring(0, 9) + "..." : room.name}
                            </text>
                        </g>
                    );
                })}
        </>
    );
}