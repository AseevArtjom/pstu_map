import { useEffect, useMemo } from "react";
import {
    Box,
    Typography,
} from "@mui/material";
import InteractiveMap from "../components/InteractiveMap.tsx";
import { useAppDispatch, useAppSelector } from "../store/store.ts";
import { fetchRoomsByBuilding } from "../store/roomSlice.ts";
import { fetchIcons } from "../store/iconSlice.ts";
import { fetchRoomTypes } from "../store/roomTypeSlice.ts";
import RoomPolygon from "../components/RoomPolygon.tsx";
import { fetchEdgesByBuilding } from "../store/edgeSlice.ts";
import { fetchNodesByBuilding } from "../store/nodeSlice.ts";
import InterFloorMarker from "../components/InterFloorMarker.tsx";
import RouteOverlay from "../components/RouteOverlay.tsx";
import type {CrossLocationLinkDraft} from "@shared/types/crossLocation/CrossLocationLinkDraft.ts";

interface FloorPageProps {
    bgMapImage: string;
    selectedFloor: number | null;
    buildingId: number;
    searchQuery: string;
    hoveredRoomId: string | null;
    setHoveredRoomId: (id: string | null) => void;
    interFloorLink: CrossLocationLinkDraft | null;
    setInterFloorLink: (link: CrossLocationLinkDraft | null) => void;
}

export default function FloorPage({
                                      bgMapImage,
                                      selectedFloor,
                                      buildingId,
                                      searchQuery,
                                      hoveredRoomId,
                                      setHoveredRoomId,
                                  }: FloorPageProps) {
    const dispatch = useAppDispatch();

    const {rooms} = useAppSelector((state) => state.room);

    const {nodes} = useAppSelector((state) => state.node);
    const {edges} = useAppSelector((state) => state.edge);


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

        return Array.from(grouped.entries()).map(([nodeId, data]) => ({nodeId, ...data}));
    }, [liveInterFloorEdges, selectedFloor]);

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

    if (!selectedFloor) return <Typography sx={{ color: '#fff', p: 2 }}>Этаж не выбран</Typography>;

    const floorRooms = rooms.filter((room) => room.floor === selectedFloor && room.roomPolygon);

    return (
        <Box sx={{width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative"}}>
            <InteractiveMap bgImage={bgMapImage}>
                {floorRooms
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
                                />
                            </g>
                        );
                    })}

                {
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
                }

                <RouteOverlay selectedFloor={selectedFloor}/>
            </InteractiveMap>

        </Box>
    );
}