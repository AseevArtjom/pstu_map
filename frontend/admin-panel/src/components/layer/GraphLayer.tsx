import {ArrowDropDown, ArrowDropUp, ElevatorOutlined, StairsOutlined} from "@mui/icons-material";
import type { Node } from "@shared/types/Node.ts";
import type { Edge } from "@shared/types/Edge.ts";

interface InterFloorInfo {
    type: string;
    remoteFloor: number;
}

interface GraphLayerProps {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    nodeToRoomMap: Record<string, { id: string; name: string }>;
    currentEditingRoomId: string | null;
    isSelectingNodeForRoom: boolean;
    interFloorNodeTypes?: Record<string, InterFloorInfo[]>;
    onNodeMouseDown: (nodeId: string, event: React.MouseEvent) => void;
    onNodeClick: (nodeId: string) => void;
    onNodeContextMenu: (nodeId: string, event: React.MouseEvent) => void;
    onEdgeContextMenu: (edgeId: number, event: React.MouseEvent) => void;
    currentFloor: number;
}

const ICON_SIZE = 16;

export default function GraphLayer({
                                       nodes, edges, selectedNodeId,
                                       nodeToRoomMap, currentEditingRoomId, isSelectingNodeForRoom,
                                       interFloorNodeTypes = {},
                                       onNodeMouseDown, onNodeClick, onNodeContextMenu, onEdgeContextMenu,currentFloor
                                   }: GraphLayerProps) {
    return (
        <g>
            {edges.map((edge) => (
                <line
                    key={edge.id}
                    x1={edge.fromNode.x} y1={edge.fromNode.y}
                    x2={edge.toNode.x} y2={edge.toNode.y}
                    stroke="#F2994A"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onContextMenu={(e) => { e.preventDefault(); onEdgeContextMenu(edge.id!, e); }}
                />
            ))}

            {nodes.map((node) => {
                const occupyingRoom = nodeToRoomMap[node.id];
                const isOccupiedByOther = occupyingRoom && occupyingRoom.id !== currentEditingRoomId;
                const isOccupiedByCurrent = occupyingRoom && occupyingRoom.id === currentEditingRoomId;
                const isSelected = selectedNodeId === node.id;
                const interFloorLinks = interFloorNodeTypes[node.id];

                let fill = "#fff";
                let stroke = "#F2994A";
                let cursor = "pointer";

                if (isSelected) {
                    fill = "#F2994A";
                } else if (isOccupiedByCurrent) {
                    fill = "#2F80ED";
                    stroke = "#2F80ED";
                } else if (isOccupiedByOther) {
                    fill = "#BDBDBD";
                    stroke = "#757575";
                    if (isSelectingNodeForRoom) {
                        cursor = "not-allowed";
                    }
                }

                if (interFloorLinks && interFloorLinks.length > 0) {
                    const isElevator = interFloorLinks[0].type === "elevator";
                    const IconComponent = isElevator ? ElevatorOutlined : StairsOutlined;
                    const baseColor = isElevator ? "#9C27B0" : "#4CAF50";
                    const iconColor = isOccupiedByOther ? "#757575" : baseColor;
                    const label = isElevator ? "Лифт" : "Лестница";

                    const hasUp = interFloorLinks.some(l => l.remoteFloor > currentFloor);
                    const hasDown = interFloorLinks.some(l => l.remoteFloor < currentFloor);

                    return (
                        <g
                            key={node.id}
                            data-node-id={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            style={{ cursor }}
                            onMouseDown={(e) => onNodeMouseDown(node.id, e)}
                            onClick={() => onNodeClick(node.id)}
                            onContextMenu={(e) => { e.preventDefault(); onNodeContextMenu(node.id, e); }}
                        >
                            <circle r={11} fill="transparent" />
                            <IconComponent
                                x={-ICON_SIZE / 2} y={-ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE}
                                style={{ color: iconColor, pointerEvents: "none" }}
                            />
                            {hasUp && (
                                <g transform="translate(8, -4)">
                                    <ArrowDropUp x={-5} y={-6} width={14} height={14} style={{ color: iconColor }} />
                                </g>
                            )}
                            {hasDown && (
                                <g transform="translate(8, 1)">
                                    <ArrowDropDown x={-5} y={-6} width={14} height={14} style={{ color: iconColor }} />
                                </g>
                            )}
                            <text
                                x={0} y={18}
                                textAnchor="middle"
                                fontSize="7"
                                fontWeight="700"
                                fill={iconColor}
                                style={{ userSelect: "none", pointerEvents: "none" }}
                            >
                                {label}
                            </text>
                        </g>
                    );
                }

                return (
                    <circle
                        key={node.id}
                        data-node-id={node.id}
                        cx={node.x} cy={node.y}
                        r={isSelected ? 7 : 5}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={2}
                        style={{ cursor }}
                        onMouseDown={(e) => onNodeMouseDown(node.id, e)}
                        onClick={() => onNodeClick(node.id)}
                        onContextMenu={(e) => { e.preventDefault(); onNodeContextMenu(node.id, e); }}
                    />
                );
            })}
        </g>
    );
}