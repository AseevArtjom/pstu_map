import type { Room } from "@shared/types/Room.ts";

interface RoomTooltipProps {
    room: Room;
    x: number;
    y: number;
}

export default function RoomTooltip({ room, x, y }: RoomTooltipProps) {
    const effectiveColor = room.customColor || room.roomType?.defaultColor || "#00B074";

    return (
        <g transform={`translate(${x}, ${y})`}>
            <foreignObject
                x="-120"
                y="-10"
                width="240"
                height="1"
                style={{ pointerEvents: "none", overflow: "visible" }}
            >
                <div
                    style={{
                        transform: "translateY(-100%)",
                        width: "max-content",
                        maxWidth: "220px",
                        margin: "0 auto",
                        background: "#14161A",
                        border: `1px solid ${effectiveColor}`,
                        borderRadius: "8px",
                        padding: "8px 12px",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)",
                        fontFamily: "Roboto, Arial, sans-serif",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            color: effectiveColor,
                            fontWeight: 700,
                            fontSize: "12px",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                        }}
                    >
                        {room.name}
                    </div>

                    {room.description && (
                        <div
                            style={{
                                color: "rgba(255, 255, 255, 0.75)",
                                fontSize: "11px",
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                            }}
                        >
                            {room.description}
                        </div>
                    )}
                </div>
            </foreignObject>
        </g>
    );
}