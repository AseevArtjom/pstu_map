import { useAppSelector } from "../store/store.ts";
import { Elevator, Stairs, PlayArrow, Flag } from "@mui/icons-material";

interface RouteOverlayProps {
    selectedFloor: number | null;
}

const MARKER_ICON_SIZE = 18;

export default function RouteOverlay({ selectedFloor }: RouteOverlayProps) {
    const { calculatedPath, pathSteps } = useAppSelector((state) => state.map);

    if (calculatedPath.length === 0) return null;
    const segments: { x1: number; y1: number; x2: number; y2: number; type: string }[] = [];

    for (let i = 1; i < calculatedPath.length; i++) {
        const prevNode = calculatedPath[i - 1];
        const node = calculatedPath[i];

        if (prevNode.floor === selectedFloor && node.floor === selectedFloor) {
            const step = pathSteps[i - 1];
            segments.push({
                x1: prevNode.x, y1: prevNode.y,
                x2: node.x, y2: node.y,
                type: step?.type || "corridor",
            });
        }
    }

    const floorPathNodes = calculatedPath.filter(n => n.floor === selectedFloor);

    const isStartNode = (nodeId: string) => calculatedPath[0]?.id === nodeId;
    const isEndNode = (nodeId: string) => calculatedPath[calculatedPath.length - 1]?.id === nodeId;

    return (
        <g style={{ pointerEvents: "none" }}>
            {segments.map((seg, i) => (
                <line
                    key={i}
                    x1={seg.x1} y1={seg.y1}
                    x2={seg.x2} y2={seg.y2}
                    stroke="#2F80ED"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="6,6"
                />
            ))}

            {floorPathNodes.map((node) => {
                if (isStartNode(node.id)) {
                    return (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={12} fill="#00B074" stroke="#fff" strokeWidth={2} />
                            <PlayArrow
                                x={-9} y={-9} width={18} height={18}
                                style={{ color: "#fff" }}
                            />
                        </g>
                    );
                }

                if (isEndNode(node.id)) {
                    return (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={12} fill="#F44336" stroke="#fff" strokeWidth={2} />
                            <Flag
                                x={-9} y={-9} width={18} height={18}
                                style={{ color: "#fff" }}
                            />
                        </g>
                    );
                }

                const isTransition = pathSteps.some(s =>
                    (s.fromNodeId === node.id || s.toNodeId === node.id) && s.type !== "corridor"
                );

                if (isTransition) {
                    const step = pathSteps.find(s => s.fromNodeId === node.id || s.toNodeId === node.id);
                    const isElevator = step?.type === "elevator";
                    const IconComponent = isElevator ? Elevator : Stairs;
                    const color = isElevator ? "#9C27B0" : "#4CAF50";

                    return (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={11} fill={color} stroke="#fff" strokeWidth={2} />
                            <IconComponent
                                x={-MARKER_ICON_SIZE / 2} y={-MARKER_ICON_SIZE / 2}
                                width={MARKER_ICON_SIZE} height={MARKER_ICON_SIZE}
                                style={{ color: "#fff" }}
                            />
                        </g>
                    );
                }

                return (
                    <circle
                        key={node.id}
                        cx={node.x} cy={node.y}
                        r={4}
                        fill="#2F80ED"
                        stroke="#fff"
                        strokeWidth={1.5}
                    />
                );
            })}
        </g>
    );
}