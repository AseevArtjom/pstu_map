import { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
} from '@mui/material';
import SideBar from "../components/SideBar";
import InteractiveMap from "../components/InteractiveMap";

import { useAppDispatch, useAppSelector } from "../store/store.ts";
import {
    fetchAllBuildings,
    setSelectedFloor,
} from "../store/buildingSlice.ts";
import { fetchRoomsByBuilding } from "../store/roomSlice.ts";
import { fetchFloorsByBuilding } from "../store/floorPlanSlice.ts";
import {fetchAllNodesGlobal} from "../store/nodeSlice.ts";
import {fetchOutdoorEdges } from "../store/edgeSlice.ts";

import { BASE_URL } from "../http.ts";

import campusBaseImg from "@shared/assets/campus_base.png";
import MapPolygon from "../components/MapPolygon.tsx";
import InterFloorMarker from "../components/InterFloorMarker.tsx";
import type {CrossLocationLinkDraft} from "@shared/types/crossLocation/CrossLocationLinkDraft.ts";
import FloorPage from "../pages/FloorPage.tsx";

export default function DesktopLayout() {
    const dispatch = useAppDispatch();

    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<number | null>(null);

    const [interFloorLink, setInterFloorLink] = useState<CrossLocationLinkDraft | null>(null);


    const { buildings, selectedFloor } = useAppSelector((state) => state.building);
    const { floors } = useAppSelector((state) => state.floorPlan);
    const allNodes = useAppSelector((state) => state.node.nodes);
    const allEdges = useAppSelector((state) => state.edge.edges);

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
    };

    useEffect(() => {
        dispatch(fetchAllBuildings());
    }, [dispatch]);

    useEffect(() => {
        if (selectedBuilding === null) {
            (async () => {
                await dispatch(fetchAllNodesGlobal()).unwrap();
                await dispatch(fetchOutdoorEdges()).unwrap();
            })();
        }
    }, [selectedBuilding, dispatch]);

    useEffect(() => {
        if (selectedBuilding) {
            dispatch(fetchRoomsByBuilding(selectedBuilding));
            dispatch(fetchFloorsByBuilding(selectedBuilding));
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



    const currentFloorPlan = floors.find(f => f.floorNumber === selectedFloor);
    const bgMapImage = currentFloorPlan ? `${BASE_URL}${currentFloorPlan.imagePath}` : "";

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
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

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                {selectedBuilding !== null && (
                    <Box sx={{ p: 2, bgcolor: "#14161A", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 500 }}>
                            {buildings.find(b => b.id === selectedBuilding)?.name || "Загрузка..."}, Этаж {selectedFloor ?? " "}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', height: '100%' }}>
                    {selectedBuilding === null ? (
                        <InteractiveMap
                            bgImage={campusBaseImg}
                            isGlobalMap={true}
                            hoveredBuilding={hoveredBuilding}
                            setHoveredBuilding={setHoveredBuilding}
                            onSelectBuilding={handleSelectBuilding}
                        >
                            {buildings.map((b) => (
                                <MapPolygon
                                    key={b.id}
                                    building={b}
                                    isHovered={hoveredBuilding === b.id}
                                    onMouseEnter={() => setHoveredBuilding(b.id)}
                                    onMouseLeave={() => setHoveredBuilding(null)}
                                    onClick={() => handleSelectBuilding(b.id)}
                                />
                            ))}

                            {outdoorInterFloorMarkers.map((marker) => (
                                <InterFloorMarker
                                    key={marker.nodeId}
                                    x={marker.x}
                                    y={marker.y}
                                    type={marker.type}
                                    remoteFloors={marker.remoteFloors}
                                    currentFloor={0}
                                />
                            ))}
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
                </Box>
            </Box>
        </Box>
    );
}