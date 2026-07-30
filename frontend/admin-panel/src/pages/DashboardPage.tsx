import { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton,
    Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useConfirm } from "material-ui-confirm";

import SideBar from "../components/SideBar";
import InteractiveMap from "../components/InteractiveMap";
import BuildingContextMenu from "../components/context/BuildingContextMenu.tsx";
import NodeContextMenu from "../components/context/NodeContextMenu.tsx";
import PolygonDrawingLayer from "../components/layer/PolygonDrawingLayer.tsx";
import GraphLayer from "../components/layer/GraphLayer.tsx";

import { useAppDispatch, useAppSelector } from "../store/store.ts";
import {
    createBuilding,
    deleteBuilding,
    fetchAllBuildings,
    setSelectedFloor,
    updateBuilding
} from "../store/buildingSlice.ts";
import { fetchRoomsByBuilding } from "../store/roomSlice.ts";
import { fetchFloorsByBuilding } from "../store/floorPlanSlice.ts";
import {createNode, deleteNode, fetchAllNodesGlobal, updateNode} from "../store/nodeSlice.ts";
import { createEdge, deleteEdge, fetchOutdoorEdges } from "../store/edgeSlice.ts";

import { BASE_URL } from "../http.ts";
import { useAuthService } from "../hooks/useAuthService.ts";
import { parsePoints, usePolygonConstructor } from "../hooks/usePolygonConstructor.ts";
import { useGraphConstructor } from "../hooks/useGraphConstructor.ts";

import campusBaseImg from "@shared/assets/campus_base.png";
import AddBuildingStep from "../modal/building/AddBuildingStep.tsx";
import FloorPage from "./FloorPage.tsx";
import MapPolygon from "../components/MapPolygon.tsx";
import type { CrossLocationLinkDraft } from "@shared/types/crossLocation/CrossLocationLinkDraft.ts";
import EdgeTypeDialog from "../components/context/EdgeTypeDialog.tsx";
import InterFloorMarker from "../components/InterFloorMarker.tsx";
import type {EdgeType} from "@shared/types/EdgeType.ts";
import RouteOverlay from "../components/RouteOverlay.tsx";

export default function DashboardPage() {
    const { logout, checkHasRole } = useAuthService();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const dispatch = useAppDispatch();
    const confirm = useConfirm();

    const [mapMode, setMapMode] = useState<'buildings' | 'graph'>('buildings');

    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<number | null>(null);

    const [interFloorLink, setInterFloorLink] = useState<CrossLocationLinkDraft | null>(null);
    const [nodeMenu, setNodeMenu] = useState<{ mouseX: number; mouseY: number; nodeId: string } | null>(null);

    const [pendingOutdoorTargetNodeId, setPendingOutdoorTargetNodeId] = useState<string | null>(null);
    const [edgeType, setEdgeType] = useState<EdgeType>("outdoor");

    const buildingConstructor = usePolygonConstructor<number>(
        "data-building-id",
        (pointsStr, id) => {
            if (id) {
                const existing = buildings.find(b => b.id === id);
                dispatch(updateBuilding({ ...existing, id, mapPolygon: pointsStr }));
            } else {
                dispatch(createBuilding({ mapPolygon: pointsStr }));
            }
        },
        Number
    );

    const outdoorGraph = useGraphConstructor(buildingConstructor.mapContainerRef);

    const { buildings, selectedFloor } = useAppSelector((state) => state.building);
    const { floors } = useAppSelector((state) => state.floorPlan);
    const allNodes = useAppSelector((state) => state.node.nodes);
    const allEdges = useAppSelector((state) => state.edge.edges);

    const currentBuilding = buildings.find(b => b.id === buildingConstructor.editingId);

    const outdoorNodes = useMemo(() => {
        return allNodes.filter(n => n && n.floor === 0 && !n.building?.id);
    }, [allNodes]);

    const outdoorEdges = useMemo(() => {
        const validNodes = allNodes.filter(Boolean);
        const nodeMap = new Map(validNodes.map(n => [n.id, n]));

        return allEdges
            .filter((e): e is NonNullable<typeof e> => Boolean(e))
            .map(e => {
                const fromId = typeof e.fromNode === 'object' && e.fromNode !== null ? e.fromNode.id : e.fromNode;
                const toId = typeof e.toNode === 'object' && e.toNode !== null ? e.toNode.id : e.toNode;

                if (!fromId || !toId) return null;

                const fromNode = nodeMap.get(fromId) || (typeof e.fromNode === 'object' ? e.fromNode : null);
                const toNode = nodeMap.get(toId) || (typeof e.toNode === 'object' ? e.toNode : null);

                if (!fromNode || !toNode) return null;

                const isFromOutdoor = fromNode.floor === 0 && !fromNode.building?.id;
                const isToOutdoor = toNode.floor === 0 && !toNode.building?.id;
                if (!isFromOutdoor || !isToOutdoor) return null;

                return {
                    ...e,
                    fromNode,
                    toNode
                };
            })
            .filter((e): e is NonNullable<typeof e> => e !== null);
    }, [allEdges, allNodes]);

    const liveInterFloorEdges = useMemo(() => {
        return allEdges
            .map(edge => {
                if (!edge) return null;
                const fromId = typeof edge.fromNode === 'object' && edge.fromNode !== null ? edge.fromNode.id : edge.fromNode;
                const toId = typeof edge.toNode === 'object' && edge.toNode !== null ? edge.toNode.id : edge.toNode;

                const freshFromNode = allNodes.find(n => n.id === fromId);
                const freshToNode = allNodes.find(n => n.id === toId);

                if (!freshFromNode || !freshToNode) return null;

                return {
                    ...edge,
                    fromNode: freshFromNode,
                    toNode: freshToNode
                };
            })
            .filter((e): e is NonNullable<typeof e> => e !== null && e.fromNode.floor !== e.toNode.floor);
    }, [allEdges, allNodes]);

    const outdoorInterFloorNodeTypes = useMemo(() => {
        const map: Record<string, { type: string; remoteFloor: number }[]> = {};

        liveInterFloorEdges.forEach(e => {
            if (e.fromNode.floor === 0) {
                if (!map[e.fromNode.id]) map[e.fromNode.id] = [];
                map[e.fromNode.id].push({ type: e.type, remoteFloor: e.toNode.floor });
            }
            if (e.toNode.floor === 0) {
                if (!map[e.toNode.id]) map[e.toNode.id] = [];
                map[e.toNode.id].push({ type: e.type, remoteFloor: e.fromNode.floor });
            }
        });

        return map;
    }, [liveInterFloorEdges]);

    const outdoorInterFloorMarkers = useMemo(() => {
        const grouped = new Map<string, { x: number; y: number; type: string; remoteFloors: number[] }>();

        liveInterFloorEdges.forEach(e => {
            const isFromOutdoor = e.fromNode.floor === 0;
            const isToOutdoor = e.toNode.floor === 0;
            if (!isFromOutdoor && !isToOutdoor) return;

            const outdoorNode = isFromOutdoor ? e.fromNode : e.toNode;
            const indoorNode = isFromOutdoor ? e.toNode : e.fromNode;

            const existing = grouped.get(outdoorNode.id);
            if (existing) {
                existing.remoteFloors.push(indoorNode.floor);
            } else {
                grouped.set(outdoorNode.id, {
                    x: outdoorNode.x,
                    y: outdoorNode.y,
                    type: e.type,
                    remoteFloors: [indoorNode.floor],
                });
            }
        });

        return Array.from(grouped.entries()).map(([nodeId, data]) => ({ nodeId, ...data }));
    }, [liveInterFloorEdges]);

    const handleSelectBuilding = (id: number | null) => {
        setSelectedBuilding(id);
        setHoveredRoomId(null);
        if (id === null && interFloorLink) {
            setMapMode('graph');
            outdoorGraph.setIsGraphMode(true);
        } else {
            setMapMode('buildings');
            outdoorGraph.setIsGraphMode(false);
        }

        buildingConstructor.resetDrawing();
    };

    useEffect(() => {
        (async () => {
            const hasAdminRole = await checkHasRole('admin');
            setIsAdmin(hasAdminRole);
        })();
    }, [checkHasRole]);

    useEffect(() => {
        if (isAdmin) {
            dispatch(fetchAllBuildings());
        }
    }, [isAdmin, dispatch]);

    useEffect(() => {
        if (isAdmin && selectedBuilding === null) {
            (async () => {
                await dispatch(fetchAllNodesGlobal()).unwrap();
                await dispatch(fetchOutdoorEdges()).unwrap();
            })();
        }
    }, [isAdmin, selectedBuilding, dispatch]);

    useEffect(() => {
        if (selectedBuilding) {
            dispatch(fetchRoomsByBuilding(selectedBuilding));
            dispatch(fetchFloorsByBuilding(selectedBuilding));
            buildingConstructor.resetDrawing();
        }
    }, [selectedBuilding, dispatch]);

    useEffect(() => {
        if (floors && floors.length > 0) {
            const sortedFloors = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);
            if (!selectedFloor || !floors.some(f => f.floorNumber === selectedFloor)) {
                dispatch(setSelectedFloor(sortedFloors[0].floorNumber));
            }
        } else if (floors && floors.length === 0 && selectedBuilding !== null) {
            dispatch(setSelectedFloor(null));
        }
    }, [floors, selectedBuilding, dispatch]);

    useEffect(() => {
        if (interFloorLink && selectedBuilding === null) {
            setMapMode('graph');
            outdoorGraph.setIsGraphMode(true);
        }
    }, [interFloorLink, selectedBuilding]);

    const handleModeChange = (newMode: 'buildings' | 'graph') => {
        setMapMode(newMode);
        outdoorGraph.setIsGraphMode(newMode === 'graph');
        buildingConstructor.resetDrawing();
    };

    const handleMapDoubleClick = (e: React.MouseEvent) => {
        if (selectedBuilding !== null) return;

        if (mapMode === 'buildings') {
            buildingConstructor.handleMapDoubleClick(e);
        } else {
            outdoorGraph.handleMapDoubleClick(e, (x, y) => {
                dispatch(createNode({ x, y, floor: 0 }));
            });
        }
    };

    const handleOutdoorNodeClick = (nodeId: string) => {
        if (interFloorLink) {
            setPendingOutdoorTargetNodeId(nodeId);
        } else {
            outdoorGraph.handleNodeClick(nodeId, (fromId, toId) => {
                const fromNode = outdoorNodes.find(n => n.id === fromId);
                const toNode = outdoorNodes.find(n => n.id === toId);

                if (fromNode && toNode) {
                    const edgePayload = outdoorGraph.buildEdgePayload(fromNode, toNode, 'outdoor');
                    dispatch(createEdge(edgePayload));
                }
            });
        }
    };

    const handleConfirmOutdoorEdge = async () => {
        if (!interFloorLink || !pendingOutdoorTargetNodeId) return;

        const fromNode = allNodes.find(n => n.id === interFloorLink.fromNodeId);
        const toNode = outdoorNodes.find(n => n.id === pendingOutdoorTargetNodeId);

        if (!fromNode || !toNode) {
            console.warn("Не удалось найти исходный или целевой узел для создания уличной связи");
            setPendingOutdoorTargetNodeId(null);
            setInterFloorLink(null);
            return;
        }

        try {
            const edgePayload = outdoorGraph.buildEdgePayload(fromNode, toNode, edgeType);

            await dispatch(createEdge(edgePayload)).unwrap();
            dispatch(fetchOutdoorEdges());
        } catch (err: any) {
            console.error("Ошибка при создании связи:", err);
        } finally {
            setPendingOutdoorTargetNodeId(null);
            setInterFloorLink(null);
        }
    };

    const handleNodeContextMenu = (nodeId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setNodeMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            nodeId
        });
    };

    if (isAdmin === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#14161A' }}>
                <CircularProgress sx={{ color: '#2F80ED' }} />
            </Box>
        );
    }

    if (isAdmin === false) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#14161A', color: '#fff' }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>Доступ запрещен</Typography>
                <Button variant="outlined" sx={{ color: '#fff' }} onClick={logout}>Выйти</Button>
            </Box>
        );
    }

    const currentFloorPlan = floors.find(f => f.floorNumber === selectedFloor);
    const bgMapImage = currentFloorPlan ? `${BASE_URL}${currentFloorPlan.imagePath}` : "";

    return (
        <Box
            onMouseMove={(e) => {
                buildingConstructor.handleMapMouseMove(e);
                if (mapMode === 'graph' && outdoorGraph.draggedNodeId) {
                    const connectedEdge = outdoorEdges.find(
                        (ed) => ed.fromNode.id === outdoorGraph.draggedNodeId || ed.toNode.id === outdoorGraph.draggedNodeId
                    );
                    const neighborId = connectedEdge
                        ? (connectedEdge.fromNode.id === outdoorGraph.draggedNodeId ? connectedEdge.toNode.id : connectedEdge.fromNode.id)
                        : null;
                    const neighborNode = outdoorNodes.find((n) => n.id === neighborId);

                    const pos = outdoorGraph.handleNodeDrag(
                        e,
                        neighborNode ? { x: neighborNode.x, y: neighborNode.y } : undefined
                    );

                    if (pos) {
                        dispatch(updateNode({ id: outdoorGraph.draggedNodeId, data: pos }));
                    }
                }
            }}
            onMouseUp={() => {
                buildingConstructor.handleMapMouseUp();
                if (mapMode === 'graph') {
                    outdoorGraph.setDraggedNodeId(null);
                }
            }}
            sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}
        >
            <SideBar
                selectedBuilding={selectedBuilding}
                hoveredBuilding={hoveredBuilding}
                setHoveredBuilding={setHoveredBuilding}
                handleSelectBuilding={(id) => handleSelectBuilding(id)}
                onChangeFloor={(floor) => dispatch(setSelectedFloor(floor))}
                onBackToMap={() => handleSelectBuilding(null)}
                availableFloors={floors.map(f => f.floorNumber)}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                hoveredRoomId={hoveredRoomId}
                setHoveredRoomId={setHoveredRoomId}
            />

            <Box
                ref={buildingConstructor.mapContainerRef}
                onContextMenu={(e) => {
                    if (selectedBuilding === null && mapMode === 'buildings') {
                        buildingConstructor.handleContextMenu(e);
                    }
                }}
                onDoubleClick={handleMapDoubleClick}
                sx={{
                    flexGrow: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
                    cursor: buildingConstructor.isDrawingMode ? 'crosshair' : 'default'
                }}
            >
                {interFloorLink && (
                    <Alert
                        severity="info"
                        action={
                            <Button color="inherit" size="small" onClick={() => setInterFloorLink(null)}>
                                Отмена
                            </Button>
                        }
                        sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 12 }}
                    >
                        Режим связывания: выберите второй узел (на карте или этаже), чтобы создать ребро.
                    </Alert>
                )}

                {selectedBuilding === null && (
                    <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 11 }}>
                        <ToggleButtonGroup
                            value={mapMode}
                            exclusive
                            onChange={(_, val) => val && handleModeChange(val)}
                            size="small"
                            sx={{
                                bgcolor: '#1C1E24',
                                p: '4px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                                display: 'flex',
                                gap: '4px',
                                '& .MuiToggleButton-root': {
                                    border: 'none',
                                    borderRadius: '6px !important',
                                    px: 1.5,
                                    py: 0.75,
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        color: 'rgba(255, 255, 255, 0.75)',
                                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                                    },
                                    '&.Mui-selected': {
                                        color: '#2F80ED',
                                        bgcolor: 'rgba(47, 128, 237, 0.15)',
                                        '&:hover': {
                                            bgcolor: 'rgba(47, 128, 237, 0.22)',
                                        },
                                    },
                                },
                            }}
                        >
                            <ToggleButton value="buildings">
                                <MapIcon sx={{ mr: 1, fontSize: 18 }} /> Корпуса
                            </ToggleButton>

                            <ToggleButton value="graph">
                                <AccountTreeIcon sx={{ mr: 1, fontSize: 18 }} /> Уличная граф-сеть
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {buildingConstructor.isDrawingMode && (
                    <Box sx={{ p: 1.5, bgcolor: "#2F80ED", color: "#fff", zIndex: 10, textAlign: 'center', boxShadow: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Двойной клик ЛКМ — создать новую точку. Зажмите ЛКМ на точке, чтобы двигать её. (Enter — сохранить, Esc — отмена)
                        </Typography>
                    </Box>
                )}

                {selectedBuilding !== null && (
                    <Box sx={{ p: 2, bgcolor: "#14161A", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 500 }}>
                            {buildings.find(b => b.id === selectedBuilding)?.name || "Загрузка..."}, Этаж {selectedFloor || " "}
                        </Typography>
                    </Box>
                )}

                {selectedBuilding === null ? (
                    <InteractiveMap
                        bgImage={campusBaseImg}
                        isGlobalMap={true}
                        hoveredBuilding={hoveredBuilding}
                        setHoveredBuilding={setHoveredBuilding}
                        onSelectBuilding={handleSelectBuilding}
                        isDrawingMode={buildingConstructor.isDrawingMode}
                        editingId={buildingConstructor.editingId}
                    >

                        {mapMode === 'buildings' && !buildingConstructor.isDrawingMode && buildings.map((b) => (
                            <MapPolygon
                                key={b.id}
                                building={b}
                                isHovered={hoveredBuilding === b.id}
                                onMouseEnter={() => setHoveredBuilding(b.id)}
                                onMouseLeave={() => setHoveredBuilding(null)}
                                onClick={() => handleSelectBuilding(b.id)}
                            />
                        ))}


                        {mapMode === 'graph' && (
                            <GraphLayer
                                nodes={outdoorNodes}
                                edges={outdoorEdges}
                                selectedNodeId={outdoorGraph.selectedNodeId}
                                interFloorNodeTypes={outdoorInterFloorNodeTypes}
                                currentFloor={0}
                                onNodeMouseDown={(id, e) => {
                                    if (interFloorLink) return;
                                    e.stopPropagation();
                                    outdoorGraph.setDraggedNodeId(id);
                                }}
                                onNodeClick={handleOutdoorNodeClick}
                                onNodeContextMenu={handleNodeContextMenu}
                                onEdgeContextMenu={(edgeId) => {
                                    confirm({
                                        title: 'Удалить путь?',
                                        description: 'Вы уверены, что хотите удалить эту связь между уличными узлами?',
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

                        {mapMode !== 'graph' && (
                            outdoorInterFloorMarkers.map((marker) => (
                                <InterFloorMarker
                                    key={marker.nodeId}
                                    x={marker.x}
                                    y={marker.y}
                                    type={marker.type}
                                    remoteFloors={marker.remoteFloors}
                                    currentFloor={0}
                                />
                            ))
                        )}

                        <RouteOverlay
                            selectedFloor={null}
                            selectedBuildingId={null}
                        />

                        {buildingConstructor.isDrawingMode && (
                            <PolygonDrawingLayer
                                polygonPoints={buildingConstructor.polygonPoints}
                                tempPoint={buildingConstructor.tempPoint}
                                draggedPointIndex={buildingConstructor.draggedPointIndex}
                                onPointMouseDown={buildingConstructor.handlePointMouseDown}
                                onPointContextMenu={buildingConstructor.handlePointContextMenu}
                                fillColor={currentBuilding?.hex_color}
                            />
                        )}
                    </InteractiveMap>
                ) : (
                    <FloorPage
                        bgMapImage={bgMapImage}
                        selectedFloor={selectedFloor}
                        buildingId={selectedBuilding}
                        searchQuery={searchQuery}
                        hoveredRoomId={hoveredRoomId}
                        setHoveredRoomId={setHoveredRoomId}
                        interFloorLink={interFloorLink}
                        setInterFloorLink={setInterFloorLink}
                    />
                )}

                <Button
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                    sx={{ position: 'absolute', top: 16, right: 16, zIndex: 11, textTransform: 'none', fontWeight: 600 }}
                >
                    Выйти
                </Button>
            </Box>

            <NodeContextMenu
                mouseX={nodeMenu?.mouseX ?? 0}
                mouseY={nodeMenu?.mouseY ?? 0}
                onClose={() => setNodeMenu(null)}
                onStartCrossLocationLink={() => {
                    if (nodeMenu) {
                        setInterFloorLink({
                            fromNodeId: nodeMenu.nodeId,
                            fromBuildingId: null,
                            fromFloor: 0,
                            edgeType: 'outdoor'
                        });
                        setNodeMenu(null);
                    }
                }}
                onDelete={() => {
                    if (nodeMenu) {
                        dispatch(deleteNode(nodeMenu.nodeId));
                        setNodeMenu(null);
                    }
                }}
            />

            <BuildingContextMenu
                mouseX={buildingConstructor.contextMenu.mouseX}
                mouseY={buildingConstructor.contextMenu.mouseY}
                targetType={buildingConstructor.contextMenu.targetType}
                targetId={buildingConstructor.contextMenu.targetId}
                onClose={buildingConstructor.handleCloseContextMenu}
                onAddBuilding={buildingConstructor.startDrawingMode}
                onEditBuilding={(id) => {
                    const building = buildings.find(b => b.id === id);
                    if (building && building.mapPolygon) {
                        const points = parsePoints(building.mapPolygon);
                        buildingConstructor.setPolygonPoints(points);
                        buildingConstructor.setEditingId(id);
                        buildingConstructor.setIsDrawingMode(true);
                        buildingConstructor.setIsEditing(true);
                    }
                }}
                onDeleteBuilding={(id) => {
                    confirm({
                        title: 'Удалить корпус?',
                        description: 'Вы уверены, что хотите удалить этот корпус? Все связанные этажи, комнаты и связи будут также удалены.',
                        confirmationText: 'Удалить',
                        cancellationText: 'Отмена',
                    }).then(({ confirmed }) => {
                        if (confirmed) {
                            dispatch(deleteBuilding(id));
                        }
                    });
                }}
            />

            <AddBuildingStep
                key={currentBuilding?.id || 'new'}
                open={buildingConstructor.isSaveModalOpen}
                onClose={() => {
                    buildingConstructor.setIsSaveModalOpen(false);
                    buildingConstructor.resetDrawing();
                }}
                points={buildingConstructor.polygonPoints}
                initialData={
                    buildingConstructor.isEditing && currentBuilding
                        ? {
                            id: currentBuilding.id,
                            name: currentBuilding.name,
                            hexColor: currentBuilding.hex_color,
                            icon: currentBuilding.icon_path || null
                        }
                        : null
                }
            />

            <EdgeTypeDialog
                open={!!pendingOutdoorTargetNodeId}
                value={edgeType}
                onChange={setEdgeType}
                onClose={() => setPendingOutdoorTargetNodeId(null)}
                onConfirm={handleConfirmOutdoorEdge}
            />
        </Box>
    );
}