import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";
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
import NodeContextMenu from "../components/context/NodeContextMenu.tsx";
import type {InterFloorLinkDraft} from "./DashboardPage.tsx";
import InterFloorMarker from "../components/InterFloorMarker.tsx";
import RouteOverlay from "../components/RouteOverlay.tsx";

interface FloorPageProps {
    bgMapImage: string;
    selectedFloor: number | null;
    buildingId: number;
    searchQuery: string;
    hoveredRoomId: string | null;
    setHoveredRoomId: (id: string | null) => void;
    interFloorLink: InterFloorLinkDraft | null;
    setInterFloorLink: (link: InterFloorLinkDraft | null) => void;
}

export default function FloorPage({
                                      bgMapImage,
                                      selectedFloor,
                                      buildingId,
                                      searchQuery,
                                      hoveredRoomId,
                                      setHoveredRoomId,
                                      interFloorLink,
                                      setInterFloorLink
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

    const [pendingTargetNodeId, setPendingTargetNodeId] = useState<string | null>(null);
    const [edgeType, setEdgeType] = useState<"stairs" | "elevator">("stairs");

    const floorNodes = nodes.filter(n => n.floor === selectedFloor);
    const floorEdges = edges.filter(e => e.fromNode.floor === selectedFloor && e.toNode.floor === selectedFloor);

    const isMapInteractionBlocked = roomConstructor.isSaveModalOpen || isSelectingNodeForRoom || !!interFloorLink;

    const [nodeContextMenu, setNodeContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        nodeId: string | null;
    }>({ mouseX: 0, mouseY: 0, nodeId: null });

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

    const liveInterFloorEdges = useMemo(() => {
        return edges
            .filter(e => e.fromNode.floor !== e.toNode.floor)
            .map(edge => {
                const freshFromNode = nodes.find(n => n.id === edge.fromNode.id);
                const freshToNode = nodes.find(n => n.id === edge.toNode.id);
                return {
                    ...edge,
                    fromNode: freshFromNode || edge.fromNode,
                    toNode: freshToNode || edge.toNode
                };
            });
    }, [edges, nodes]);

    const interFloorMarkers = useMemo(() => {
        const grouped = new Map<string, { x: number; y: number; type: string; remoteFloors: number[] }>();

        liveInterFloorEdges.forEach(e => {
            const isFromLocal = e.fromNode.floor === selectedFloor;
            const isToLocal = e.toNode.floor === selectedFloor;
            if (!isFromLocal && !isToLocal) return;

            const localNode = isFromLocal ? e.fromNode : e.toNode;
            const remoteNode = isFromLocal ? e.toNode : e.fromNode;

            const existing = grouped.get(localNode.id);
            if (existing) {
                existing.remoteFloors.push(remoteNode.floor);
            } else {
                grouped.set(localNode.id, {
                    x: localNode.x,
                    y: localNode.y,
                    type: e.type,
                    remoteFloors: [remoteNode.floor],
                });
            }
        });

        return Array.from(grouped.entries()).map(([nodeId, data]) => ({ nodeId, ...data }));
    }, [liveInterFloorEdges, selectedFloor]);

    const interFloorNodeTypes = useMemo(() => {
        const map: Record<string, { type: string; remoteFloor: number }[]> = {};

        liveInterFloorEdges.forEach(e => {
            if (e.fromNode.floor === selectedFloor) {
                if (!map[e.fromNode.id]) map[e.fromNode.id] = [];
                map[e.fromNode.id].push({ type: e.type, remoteFloor: e.toNode.floor });
            }
            if (e.toNode.floor === selectedFloor) {
                if (!map[e.toNode.id]) map[e.toNode.id] = [];
                map[e.toNode.id].push({ type: e.type, remoteFloor: e.fromNode.floor });
            }
        });

        return map;
    }, [liveInterFloorEdges, selectedFloor]);

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

    const handleSelectTargetNode = (targetId: string) => {
        if (!interFloorLink) return;

        if (targetId === interFloorLink.fromNodeId) {
            confirm({
                title: "Ошибка связи",
                description: "Нельзя связать узел сам с собой!",
                confirmationText: "ОК",
                hideCancelButton: true
            });
            return;
        }

        setPendingTargetNodeId(targetId);
    };

    const handleConfirmEdgeCreation = () => {
        if (interFloorLink && pendingTargetNodeId) {
            dispatch(createEdge({
                fromNodeId: interFloorLink.fromNodeId,
                toNodeId: pendingTargetNodeId,
                weight: edgeType === "elevator" ? 15 : 25,
                type: edgeType
            }));

            setInterFloorLink(null);
            setPendingTargetNodeId(null);
        }
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

                if (interFloorLink) {
                    e.stopPropagation();
                    graphConstructor.handleMapDoubleClick(e, async (x, y) => {
                        const newNode = await dispatch(createNode({ floor: selectedFloor, x, y, buildingId })).unwrap();
                        handleSelectTargetNode(newNode.id);
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
            sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
        >
            {isSelectingNodeForRoom && (
                <Box sx={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: '#2F80ED', color: '#fff', px: 3, py: 1, borderRadius: '20px', boxShadow: 3, fontWeight: 500 }}>
                    Режим привязки: выберите существующий узел
                </Box>
            )}

            {interFloorLink && (
                <Box sx={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: '#4CAF50', color: '#fff', px: 3, py: 1, borderRadius: '20px', boxShadow: 3, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span>Связь с этажа {interFloorLink.fromFloor}: перейдите на нужный этаж и выберите/создайте узел</span>
                    <Button size="small" variant="contained" color="error" onClick={() => setInterFloorLink(null)}>
                        Отмена
                    </Button>
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

                {(graphConstructor.isGraphMode || isSelectingNodeForRoom || !!interFloorLink) && (
                    <GraphLayer
                        nodes={floorNodes}
                        edges={liveEdges}
                        selectedNodeId={graphConstructor.selectedNodeId}
                        nodeToRoomMap={nodeToRoomMap}
                        currentEditingRoomId={roomConstructor.editingId}
                        isSelectingNodeForRoom={isSelectingNodeForRoom}
                        interFloorNodeTypes={interFloorNodeTypes}
                        currentFloor={selectedFloor}
                        onNodeMouseDown={(id, e) => {
                            if (!!interFloorLink) return;
                            const occupyingRoom = nodeToRoomMap[id];
                            if (isSelectingNodeForRoom && occupyingRoom && occupyingRoom.id !== roomConstructor.editingId) {
                                return;
                            }
                            e.stopPropagation();
                            graphConstructor.setDraggedNodeId(id);
                        }}
                        onNodeClick={(id) => {
                            if (interFloorLink) {
                                handleSelectTargetNode(id);
                                return;
                            }

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
                        onNodeContextMenu={(id, e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNodeContextMenu({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                nodeId: id,
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

                {!graphConstructor.isGraphMode && !isSelectingNodeForRoom && !interFloorLink && (
                    interFloorMarkers.map((marker) => (
                        <InterFloorMarker
                            key={marker.nodeId}
                            x={marker.x}
                            y={marker.y}
                            type={marker.type}
                            remoteFloors={marker.remoteFloors}
                            currentFloor={selectedFloor}
                        />
                    ))
                )}

                <RouteOverlay selectedFloor={selectedFloor}/>
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

            <NodeContextMenu
                mouseX={nodeContextMenu.mouseX}
                mouseY={nodeContextMenu.mouseY}
                onClose={() => setNodeContextMenu({ mouseX: 0, mouseY: 0, nodeId: null })}
                onStartInterFloorLink={() => {
                    if (nodeContextMenu.nodeId) {
                        setInterFloorLink({
                            fromNodeId: nodeContextMenu.nodeId,
                            fromFloor: selectedFloor
                        });
                    }
                }}
                onDelete={() => {
                    if (nodeContextMenu.nodeId) {
                        confirm({
                            title: 'Удалить узел?',
                            description: 'Вы уверены, что хотите полностью удалить этот узел и все связанные пути?',
                            confirmationText: 'Удалить',
                            cancellationText: 'Отмена',
                        }).then(({ confirmed }) => {
                            if (confirmed && nodeContextMenu.nodeId) {
                                dispatch(deleteNode(nodeContextMenu.nodeId));
                            }
                        });
                    }
                }}
            />

            <Dialog
                open={!!pendingTargetNodeId}
                onClose={() => setPendingTargetNodeId(null)}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: "#1C1E22",
                            color: "#E4E6EB",
                            border: "1px solid rgba(255, 255, 255, 0.08)"
                        }
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    Тип межэтажного перехода
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    <Typography variant="body2" sx={{ color: "#90949C", mb: 2 }}>
                        Выберите, каким образом связаны эти узлы на разных этажах:
                    </Typography>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={edgeType}
                            onChange={(e) => setEdgeType(e.target.value as "stairs" | "elevator")}
                        >
                            <FormControlLabel
                                value="stairs"
                                control={<Radio sx={{ color: '#2F80ED', '&.Mui-checked': { color: '#2F80ED' } }} />}
                                label="Лестница"
                            />
                            <FormControlLabel
                                value="elevator"
                                control={<Radio sx={{ color: '#2F80ED', '&.Mui-checked': { color: '#2F80ED' } }} />}
                                label="Лифт"
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <Button onClick={() => setPendingTargetNodeId(null)} sx={{ color: '#90949C' }}>
                        Отмена
                    </Button>
                    <Button onClick={handleConfirmEdgeCreation} variant="contained" sx={{ bgcolor: '#2F80ED', '&:hover': { bgcolor: '#1b60b8' } }}>
                        Создать связь
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}