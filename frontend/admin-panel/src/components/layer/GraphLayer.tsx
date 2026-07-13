import type { Node } from "@shared/types/Node.ts";
import type { Edge } from "@shared/types/Edge.ts";

interface GraphLayerProps {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    nodeToRoomMap: Record<string, { id: string; name: string }>;
    currentEditingRoomId: string | null;
    isSelectingNodeForRoom: boolean;
    onNodeMouseDown: (nodeId: string, event: React.MouseEvent) => void;
    onNodeClick: (nodeId: string) => void;
    onNodeContextMenu: (nodeId: string, event: React.MouseEvent) => void;
    onEdgeContextMenu: (edgeId: number, event: React.MouseEvent) => void;
}

export default function GraphLayer({
                                       nodes, edges, selectedNodeId,
                                       nodeToRoomMap, currentEditingRoomId, isSelectingNodeForRoom,
                                       onNodeMouseDown, onNodeClick, onNodeContextMenu, onEdgeContextMenu
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