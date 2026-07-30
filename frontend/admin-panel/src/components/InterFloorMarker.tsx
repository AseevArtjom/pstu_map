import {
    ArrowDropUp,
    ArrowDropDown,
    StairsOutlined,
    ElevatorOutlined,
    MeetingRoomOutlined
} from "@mui/icons-material";

interface InterFloorMarkerProps {
    x: number;
    y: number;
    type: string;
    remoteFloors: number[];
    currentFloor: number;
    onClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

const ICON_SIZE = 16;
const ARROW_SIZE = 14;

export default function InterFloorMarker({
                                             x, y, type, remoteFloors, currentFloor, onClick, onContextMenu
                                         }: InterFloorMarkerProps) {
    const isElevator = type === "elevator";
    const isStairs = type === "stairs";

    const isOutdoor =
        type === "outdoor" ||
        type === "transition" ||
        type === "entrance" ||
        (!isElevator && !isStairs && (currentFloor === 0 || remoteFloors.includes(0)));

    let IconComponent = StairsOutlined;
    let color = "#4CAF50";
    let label = "Лестница";

    if (isElevator) {
        IconComponent = ElevatorOutlined;
        color = "#9C27B0";
        label = "Лифт";
    } else if (isOutdoor) {
        IconComponent = MeetingRoomOutlined;
        color = "#2F80ED";
        label = "Вход / Выход";
    }

    const indoorFloors = remoteFloors.filter(f => f !== 0);
    const hasUp = indoorFloors.some(f => f > currentFloor);
    const hasDown = indoorFloors.some(f => f < currentFloor);

    return (
        <g
            transform={`translate(${x}, ${y})`}
            style={{ cursor: "pointer" }}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <IconComponent
                x={-ICON_SIZE / 2}
                y={-ICON_SIZE / 2}
                width={ICON_SIZE}
                height={ICON_SIZE}
                style={{ color, pointerEvents: "none" }}
            />

            {!isOutdoor && hasUp && (
                <g transform="translate(10, -2)">
                    <ArrowDropUp
                        x={-ARROW_SIZE / 2}
                        y={-ARROW_SIZE / 2 - 1}
                        width={ARROW_SIZE}
                        height={ARROW_SIZE}
                        style={{ color, pointerEvents: "none" }}
                    />
                </g>
            )}

            {!isOutdoor && hasDown && (
                <g transform="translate(10, 1)">
                    <ArrowDropDown
                        x={-ARROW_SIZE / 2}
                        y={-ARROW_SIZE / 2 + 1}
                        width={ARROW_SIZE}
                        height={ARROW_SIZE}
                        style={{ color, pointerEvents: "none" }}
                    />
                </g>
            )}

            <text
                x={0}
                y={18}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={color}
                style={{ userSelect: "none", pointerEvents: "none" }}
            >
                {label}
            </text>
        </g>
    );
}