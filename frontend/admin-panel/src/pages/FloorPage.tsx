import {useEffect, useMemo, useState} from "react";
import { Box, Button, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import InteractiveMap from "../components/InteractiveMap.tsx";
import RoomContextMenu from "../components/context/RoomContextMenu.tsx";
import RoomFormModal from "../modal/room/RoomFormModal.tsx";
import { usePolygonConstructor, formatPoints, parsePoints } from "../hooks/usePolygonConstructor.ts";
import PolygonDrawingLayer from "../components/layer/PolygonDrawingLayer.tsx";
import { useAppDispatch, useAppSelector } from "../store/store.ts";
import { createRoom, updateRoom, deleteRoom, fetchRoomsByBuilding } from "../store/roomSlice.ts";
import { fetchIcons } from "../store/iconSlice.ts";
import { fetchRoomTypes } from "../store/roomTypeSlice.ts";
import RoomPolygon from "../components/RoomPolygon.tsx";
import { useGraphConstructor } from "../hooks/useGraphConstructor.ts";
import GraphLayer from "../components/layer/GraphLayer.tsx";
import { createEdge, deleteEdge, fetchEdgesByBuilding } from "../store/edgeSlice.ts";
import { createNode, deleteNode, fetchNodesByBuilding, updateNode } from "../store/nodeSlice.ts";

interface FloorPageProps {
    bgMapImage: string;
    selectedFloor: number | null;
    buildingId: number;
    searchQuery: string;
    hoveredRoomId: string | null;
    setHoveredRoomId: (id: string | null) => void;
}

export default function FloorPage({
                                      bgMapImage,
                                      selectedFloor,
                                      buildingId,
                                      searchQuery,
                                      hoveredRoomId,
                                      setHoveredRoomId
                                  }: FloorPageProps) {
    const dispatch = useAppDispatch();
    const confirm = useConfirm();

    const roomConstructor = usePolygonConstructor<string>("data-room-id", () => {});

    const { icons } = useAppSelector((state) => state.icon);
    const { roomTypes } = useAppSelector((state) => state.roomType);
    const { rooms } = useAppSelector((state) => state.room);

    const graphConstructor = useGraphConstructor(roomConstructor.mapContainerRef);
    const { nodes } = useAppSelector((state) => state.node);
    const { edges } = useAppSelector((state) => state.edge);

    const [roomDraft, setRoomDraft] = useState<any | null>(null);
    const [isSelectingNodeForRoom, setIsSelectingNodeForRoom] = useState(false);
    const floorNodes = nodes.filter(n => n.floor === selectedFloor);
    const floorEdges = edges.filter(e => e.fromNode.floor === selectedFloor && e.toNode.floor === selectedFloor);

    const isMapInteractionBlocked = roomConstructor.isSaveModalOpen || isSelectingNodeForRoom;

    const nodeToRoomMap = useMemo(() => {
        const map: Record<string, { id: string; name: string }> = {};
        rooms.forEach((room) => {
            if (room.node?.id) {
                map[room.node.id] = { id: room.id, name: room.name };
            }
        });
        return map;
    }, [rooms]);

    const liveEdges = useMemo(() => {
        return floorEdges.map(edge => {
            const freshFromNode = nodes.find(n => n.id === edge.fromNode.id);
            const freshToNode = nodes.find(n => n.id === edge.toNode.id);
            return {
                ...edge,
                fromNode: freshFromNode || edge.fromNode,
                toNode: freshToNode || edge.toNode
            };
        });
    }, [floorEdges, nodes]);

    const editingRoom = roomConstructor.isEditing && roomConstructor.editingId
        ? rooms.find(r => r.id === roomConstructor.editingId)
        : null;

    const drawingFillColor = editingRoom
        ? (editingRoom.customColor || editingRoom.roomType?.defaultColor || "#2F80ED")
        : "#2F80ED";

    const modalInitialData = useMemo(() => {
        if (roomDraft) return roomDraft;
        if (!editingRoom) return null;

        return {
            name: editingRoom.name,
            roomTypeId: editingRoom.roomType.id,
            customColor: editingRoom.customColor,
            customIconId: icons.find(i => i.filePath === editingRoom.customIconPath)?.id ?? null,
            description: editingRoom.description,
            nodeId: editingRoom.node?.id ?? null,
        };
    }, [editingRoom, icons, roomDraft]);

    useEffect(() => {
        dispatch(fetchIcons());
        dispatch(fetchRoomTypes());
    }, [dispatch]);

    useEffect(() => {
        if (buildingId) {
            dispatch(fetchRoomsByBuilding(buildingId));
            dispatch(fetchNodesByBuilding(buildingId));
            dispatch(fetchEdgesByBuilding(buildingId));
        }
    }, [buildingId, dispatch]);

    if (!selectedFloor) return <Typography>Этаж не выбран</Typography>;

    const menuTargetType =
        roomConstructor.contextMenu.targetType === 'item'
            ? 'room'
            : roomConstructor.contextMenu.targetType === 'map'
                ? 'floor_map'
                : null;

    const cleanDrafts = () => {
        setRoomDraft(null);
        setIsSelectingNodeForRoom(false);
    };

    const handleModalSave = (formData: {
        id: string | null;
        name: string;
        floor: number;
        roomTypeId: number;
        description?: string | null;
        roomPolygon: string;
        customColor: string | null;
        customIconId: number | null;
        nodeId: string | null;
    }) => {
        if (roomConstructor.isEditing && roomConstructor.editingId) {
            dispatch(updateRoom({
                id: roomConstructor.editingId,
                data: {
                    name: formData.name,
                    floor: formData.floor,
                    roomTypeId: formData.roomTypeId,
                    description: formData.description?.trim() ? formData.description.trim() : undefined,
                    buildingId,
                    nodeId: formData.nodeId ?? undefined,
                    roomPolygon: formData.roomPolygon,
                    customColor: formData.customColor ?? undefined,
                    customIconId: formData.customIconId ?? undefined,
                }
            }));
        } else {
            dispatch(createRoom({
                id: formData.id ?? crypto.randomUUID(),
                name: formData.name,
                floor: formData.floor,
                roomTypeId: formData.roomTypeId,
                description: formData.description?.trim() ? formData.description.trim() : undefined,
                buildingId,
                nodeId: formData.nodeId,
                qrCode: null,
                roomPolygon: formData.roomPolygon,
                customColor: formData.customColor ?? undefined,
                customIconId: formData.customIconId ?? undefined,
            }));
        }

        roomConstructor.resetDrawing();
        cleanDrafts();
    };

    const floorRooms = rooms.filter((room) => room.floor === selectedFloor && room.roomPolygon);

    return (
        <Box
            ref={roomConstructor.mapContainerRef}
            onContextMenu={(e) => {
                if (graphConstructor.isGraphMode || isMapInteractionBlocked) {
                    e.preventDefault();
                    return;
                }
                roomConstructor.handleContextMenu(e);
            }}
            onDoubleClick={(e) => {
                if (roomConstructor.isSaveModalOpen) {
                    e.stopPropagation();
                    return;
                }

                if (isSelectingNodeForRoom) {
                    e.stopPropagation();
                    graphConstructor.handleMapDoubleClick(e, async (x, y) => {
                        const newNode = await dispatch(createNode({ floor: selectedFloor, x, y, buildingId })).unwrap();
                        setRoomDraft((prev: any) => ({ ...prev, nodeId: newNode.id }));
                        setIsSelectingNodeForRoom(false);
                        roomConstructor.setIsSaveModalOpen(true);
                    });
                    return;
                }

                roomConstructor.handleMapDoubleClick(e);
                graphConstructor.handleMapDoubleClick(e, (x, y) => {
                    dispatch(createNode({ floor: selectedFloor, x, y, buildingId }));
                });
            }}
            onMouseMove={(e) => {
                if (!isMapInteractionBlocked) {
                    roomConstructor.handleMapMouseMove(e);
                }

                if (graphConstructor.draggedNodeId) {
                    const pos = graphConstructor.handleNodeDrag(e);
                    if (pos) {
                        dispatch(updateNode({ id: graphConstructor.draggedNodeId, data: pos }));
                    }
                }
            }}
            onMouseUp={() => {
                if (!isMapInteractionBlocked) {
                    roomConstructor.handleMapMouseUp();
                }
                graphConstructor.setDraggedNodeId(null);
            }}
            sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
        >
            {isSelectingNodeForRoom && (
                <Box sx={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: '#2F80ED', color: '#fff', px: 3, py: 1, borderRadius: '20px', boxShadow: 3, fontWeight: 500 }}>
                    Режим привязки: выберите существующий узел
                </Box>
            )}
            <Button onClick={() => graphConstructor.setIsGraphMode(v => !v)}>
                {graphConstructor.isGraphMode ? "Завершить разметку путей" : "Разметить пути"}
            </Button>
            <InteractiveMap bgImage={bgMapImage}>
                {floorRooms
                    .filter((room) => room.id !== roomConstructor.editingId)
                    .map((room) => {
                        const isMatched = searchQuery.trim() === "" ||
                            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));

                        return (
                            <g
                                key={room.id}
                                style={{
                                    transition: "opacity 0.25s ease-in-out",
                                    opacity: isMatched ? 1 : 0.15,
                                    pointerEvents: isMatched ? "auto" : "none"
                                }}
                            >
                                <RoomPolygon
                                    room={room}
                                    isHovered={hoveredRoomId === room.id}
                                    onMouseEnter={() => setHoveredRoomId(room.id)}
                                    onMouseLeave={() => setHoveredRoomId(null)}
                                    onClick={() => console.log("Клик по комнате:", room.name)}
                                />
                            </g>
                        );
                    })}

                {roomConstructor.isDrawingMode && (
                    <PolygonDrawingLayer
                        polygonPoints={roomConstructor.polygonPoints}
                        tempPoint={isMapInteractionBlocked ? null : roomConstructor.tempPoint}
                        draggedPointIndex={isMapInteractionBlocked ? -1 : roomConstructor.draggedPointIndex}
                        onPointMouseDown={isMapInteractionBlocked ? () => {} : roomConstructor.handlePointMouseDown}
                        onPointContextMenu={isMapInteractionBlocked ? () => {} : roomConstructor.handlePointContextMenu}
                        fillColor={drawingFillColor}
                    />
                )}

                {(graphConstructor.isGraphMode || isSelectingNodeForRoom) && (
                    <GraphLayer
                        nodes={floorNodes}
                        edges={liveEdges}
                        selectedNodeId={graphConstructor.selectedNodeId}
                        nodeToRoomMap={nodeToRoomMap}
                        currentEditingRoomId={roomConstructor.editingId}
                        isSelectingNodeForRoom={isSelectingNodeForRoom}
                        onNodeMouseDown={(id, e) => {
                            const occupyingRoom = nodeToRoomMap[id];
                            if (isSelectingNodeForRoom && occupyingRoom && occupyingRoom.id !== roomConstructor.editingId) {
                                return;
                            }
                            e.stopPropagation();
                            graphConstructor.setDraggedNodeId(id);
                        }}
                        onNodeClick={(id) => {
                            if (isSelectingNodeForRoom) {
                                const occupyingRoom = nodeToRoomMap[id];

                                if (occupyingRoom && occupyingRoom.id !== roomConstructor.editingId) {
                                    confirm({
                                        title: 'Узел уже занят',
                                        description: `Этот узел уже привязан к комнате: "${occupyingRoom.name}". Пожалуйста, выберите другой узел.`,
                                        confirmationText: 'ОК',
                                        hideCancelButton: true,
                                    });
                                    return;
                                }

                                setRoomDraft((prev: any) => ({ ...prev, nodeId: id }));
                                setIsSelectingNodeForRoom(false);
                                roomConstructor.setIsSaveModalOpen(true);
                                return;
                            }
                            graphConstructor.handleNodeClick(id, (fromId, toId) => {
                                const alreadyExists = floorEdges.some(edge =>
                                    (edge.fromNode.id === fromId && edge.toNode.id === toId) ||
                                    (edge.fromNode.id === toId && edge.toNode.id === fromId)
                                );

                                if (alreadyExists) return;

                                dispatch(createEdge({ fromNodeId: fromId, toNodeId: toId, weight: 1, type: "corridor" }));
                            });
                        }}
                        onNodeContextMenu={(id) => {
                            confirm({
                                title: 'Удалить узел?',
                                description: 'Вы уверены, что хотите полностью удалить этот узел и все связанные пути?',
                                confirmationText: 'Удалить',
                                cancellationText: 'Отмена',
                            }).then(({ confirmed }) => {
                                if (confirmed) {
                                    dispatch(deleteNode(id));
                                }
                            });
                        }}
                        onEdgeContextMenu={(edgeId) => {
                            confirm({
                                title: 'Удалить путь?',
                                description: 'Вы уверены, что хотите удалить эту связь между узлами?',
                                confirmationText: 'Удалить',
                                cancellationText: 'Отмена',
                            }).then(({ confirmed }) => {
                                if (confirmed) {
                                    dispatch(deleteEdge(edgeId));
                                }
                            });
                        }}
                    />
                )}
            </InteractiveMap>

            <RoomContextMenu
                mouseX={roomConstructor.contextMenu.mouseX}
                mouseY={roomConstructor.contextMenu.mouseY}
                targetType={menuTargetType}
                targetId={roomConstructor.contextMenu.targetId}
                onClose={roomConstructor.handleCloseContextMenu}
                onAddRoom={() => {
                    roomConstructor.startDrawingMode();
                    roomConstructor.handleCloseContextMenu();
                }}
                onEditRoom={(id) => {
                    const room = rooms.find(r => r.id === id);
                    if (room && room.roomPolygon) {
                        const points = parsePoints(room.roomPolygon);
                        roomConstructor.setPolygonPoints(points);
                        roomConstructor.setEditingId(id);
                        roomConstructor.setIsEditing(true);
                        roomConstructor.setIsDrawingMode(true);
                    }
                    roomConstructor.handleCloseContextMenu();
                }}
                onDeleteRoom={(id) => {
                    confirm({
                        title: 'Удалить комнату?',
                        description: 'Вы действительно хотите безвозвратно удалить эту комнату?',
                        confirmationText: 'Удалить',
                        cancellationText: 'Отмена',
                    }).then(({ confirmed }) => {
                        if (confirmed) {
                            dispatch(deleteRoom(id));
                        }
                    });
                }}
            />

            <RoomFormModal
                key={editingRoom?.id || (roomDraft ? 'draft' : 'new')}
                isOpen={roomConstructor.isSaveModalOpen}
                onClose={() => {
                    roomConstructor.setIsSaveModalOpen(false);
                    roomConstructor.resetDrawing();
                    cleanDrafts();
                }}
                onSave={handleModalSave}
                onSelectNodeReq={(currentValues) => {
                    setRoomDraft(currentValues);
                    setIsSelectingNodeForRoom(true);
                    roomConstructor.setIsSaveModalOpen(false);
                }}
                polygonPoints={formatPoints(roomConstructor.polygonPoints)}
                floor={selectedFloor}
                roomTypes={roomTypes}
                availableIcons={icons}
                initialData={modalInitialData}
            />
        </Box>
    );
}