import {ArrowDropUp, ArrowDropDown, StairsOutlined, ElevatorOutlined} from "@mui/icons-material";

interface InterFloorMarkerProps {
    x: number;
    y: number;
    type: string;
    remoteFloors: number[];
    currentFloor: number;
    onClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

const ICON_SIZE = 14;
const ARROW_SIZE = 14;

export default function InterFloorMarker({
                                             x, y, type, remoteFloors, currentFloor, onClick, onContextMenu
                                         }: InterFloorMarkerProps) {
    const isElevator = type === "elevator";
    const color = isElevator ? "#9C27B0" : "#4CAF50";
    const IconComponent = isElevator ? ElevatorOutlined : StairsOutlined;
    const label = isElevator ? "Лифт" : "Лестница";

    const hasUp = remoteFloors.some(f => f > currentFloor);
    const hasDown = remoteFloors.some(f => f < currentFloor);

    return (
        <g
            transform={`translate(${x}, ${y})`}
            style={{ cursor: "pointer" }}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <IconComponent
                x={-ICON_SIZE / 2} y={-ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE}
                style={{ color, pointerEvents: "none" }}
            />

            {hasUp && (
                <g transform="translate(10, -2)">
                    <ArrowDropUp
                        x={-ARROW_SIZE / 2} y={-ARROW_SIZE / 2 - 1}
                        width={ARROW_SIZE} height={ARROW_SIZE}
                        style={{ color, pointerEvents: "none" }}
                    />
                </g>
            )}

            {hasDown && (
                <g transform="translate(10, 1)">
                    <ArrowDropDown
                        x={-ARROW_SIZE / 2} y={-ARROW_SIZE / 2 + 1}
                        width={ARROW_SIZE} height={ARROW_SIZE}
                        style={{ color, pointerEvents: "none" }}
                    />
                </g>
            )}

            <text
                x={0} y={16}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill={color}
                style={{ userSelect: "none", pointerEvents: "none" }}
            >
                {label}
            </text>
        </g>
    );
}