import { useAppSelector } from "../store/store.ts";
import { Elevator, Stairs, PlayArrow, Flag, ArrowUpward, ArrowDownward } from "@mui/icons-material";

interface RouteOverlayProps {
    selectedFloor: number | null;
    selectedBuildingId: number | null;
}

const MARKER_ICON_SIZE = 18;

export default function RouteOverlay({ selectedFloor, selectedBuildingId }: RouteOverlayProps) {
    const { calculatedPath, pathSteps } = useAppSelector((state) => state.map);

    if (calculatedPath.length === 0) return null;

    const getBuildingId = (node: any) => node.buildingId ?? node.building?.id ?? null;

    const isGlobalMode = selectedBuildingId === null;

    const floorPathNodes = calculatedPath.filter((node) => {
        if (isGlobalMode) {
            return getBuildingId(node) === null;
        }
        return getBuildingId(node) === selectedBuildingId && node.floor === selectedFloor;
    });

    if (floorPathNodes.length === 0) return null;

    const segments: { x1: number; y1: number; x2: number; y2: number; type: string }[] = [];

    for (let i = 1; i < calculatedPath.length; i++) {
        const prevNode = calculatedPath[i - 1];
        const node = calculatedPath[i];

        const isPrevValid = isGlobalMode
            ? getBuildingId(prevNode) === null
            : getBuildingId(prevNode) === selectedBuildingId && prevNode.floor === selectedFloor;

        const isNodeValid = isGlobalMode
            ? getBuildingId(node) === null
            : getBuildingId(node) === selectedBuildingId && node.floor === selectedFloor;

        if (isPrevValid && isNodeValid) {
            const step = pathSteps[i - 1];
            segments.push({
                x1: prevNode.x, y1: prevNode.y,
                x2: node.x, y2: node.y,
                type: step?.type || "corridor",
            });
        }
    }

    const firstOutdoorId = calculatedPath.find(n => getBuildingId(n) === null)?.id;
    const lastOutdoorId = [...calculatedPath].reverse().find(n => getBuildingId(n) === null)?.id;

    const startNodeId = isGlobalMode ? firstOutdoorId : calculatedPath[0]?.id;
    const endNodeId = isGlobalMode ? lastOutdoorId : calculatedPath[calculatedPath.length - 1]?.id;

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
                const isStart = node.id === startNodeId;
                const isEnd = node.id === endNodeId;

                if (isStart) {
                    return (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={9} fill="#00B074" stroke="#fff" strokeWidth={1.5} />
                            <PlayArrow x={-7} y={-7} width={14} height={14} style={{ color: "#fff" }} />
                        </g>
                    );
                }

                if (isEnd) {
                    return (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={9} fill="#F44336" stroke="#fff" strokeWidth={1.5} />
                            <Flag x={-7} y={-7} width={14} height={14} style={{ color: "#fff" }} />
                        </g>
                    );
                }

                const transitionStep = pathSteps.find(
                    (s) => (s.fromNodeId === node.id || s.toNodeId === node.id) &&
                        (s.type === "stairs" || s.type === "elevator")
                );

                if (transitionStep) {
                    const isElevator = transitionStep.type === "elevator";
                    const IconComponent = isElevator ? Elevator : Stairs;
                    const color = isElevator ? "#9C27B0" : "#4CAF50";

                    const isUp = transitionStep.toFloor > transitionStep.fromFloor;
                    const DirectionIcon = isUp ? ArrowUpward : ArrowDownward;

                    return (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r={12} fill={color} stroke="#fff" strokeWidth={2} />
                            <IconComponent
                                x={-MARKER_ICON_SIZE / 2}
                                y={-MARKER_ICON_SIZE / 2}
                                width={MARKER_ICON_SIZE}
                                height={MARKER_ICON_SIZE}
                                style={{ color: "#fff" }}
                            />
                            <g transform="translate(8, -8)">
                                <circle r={4} fill={isUp ? "#2196F3" : "#FF9800"} stroke="#fff" strokeWidth={1} />
                                <DirectionIcon
                                    x={-3.5}
                                    y={-3.5}
                                    width={7}
                                    height={7}
                                    style={{ color: "#fff" }}
                                />
                            </g>
                        </g>
                    );
                }

                return (
                    <circle
                        key={node.id}
                        cx={node.x}
                        cy={node.y}
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