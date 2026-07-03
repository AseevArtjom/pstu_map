import { Box, Typography } from "@mui/material";
import SideBar from "../components/SideBar.tsx";
import InteractiveMap from "../components/InteractiveMap.tsx";
import { useAppDispatch, useAppSelector } from "../store/store.ts";
import { useEffect, useState } from "react";
import { fetchAllBuildings, setSelectedFloor } from "../store/buildingSlice.ts";
import RoomLabels from "../components/RoomLabels.tsx";
import { fetchRoomsByBuilding } from "../store/roomSlice.ts";
import { fetchFloorsByBuilding } from "../store/floorPlanSlice.ts";
import {BASE_URL} from "../http.ts";
import CampusMap from "@shared/assets/campus_base.png";

interface DesktopLayoutProps {
    selectedBuilding: number | null;
    hoveredBuilding: number | null;
    setHoveredBuilding: (id: number | null) => void;
    handleSelectBuilding: (buildingId: number) => void;
    handleBackToGlobalMap: () => void;
}

function DesktopLayout({
                           selectedBuilding,
                           hoveredBuilding,
                           setHoveredBuilding,
                           handleSelectBuilding,
                           handleBackToGlobalMap,
                       }: DesktopLayoutProps) {

    const dispatch = useAppDispatch();

    const { buildings, selectedFloor } = useAppSelector((state) => state.building);
    const { floors } = useAppSelector((state) => state.floorPlan);

    const currentBuilding = buildings.find(b => b.id === selectedBuilding);
    const [currentMapSize, setCurrentMapSize] = useState({ width: 805, height: 780 });

    useEffect(() => {
        dispatch(fetchAllBuildings());
    }, [dispatch]);

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

    const floorImage = currentFloorPlan
        ? `${BASE_URL}${currentFloorPlan.imagePath}`
        : `/src/assets/floors/building_${selectedBuilding}_floor_${selectedFloor}.png`;

    const availableFloors = floors.map(f => f.floorNumber);

    return (
        <Box sx={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
            <SideBar
                selectedBuilding={selectedBuilding}
                hoveredBuilding={hoveredBuilding}
                setHoveredBuilding={setHoveredBuilding}
                handleSelectBuilding={handleSelectBuilding}
                onChangeFloor={(floor) => dispatch(setSelectedFloor(floor))}
                onBackToMap={handleBackToGlobalMap}
                availableFloors={availableFloors}
            />

            <Box component="main" sx={{ flexGrow: 1, height: "100%", width: "100%", position: "relative" }}>
                {selectedBuilding === null ? (
                    <InteractiveMap
                        bgImage={`${CampusMap}`}
                        isGlobalMap={true}
                        hoveredBuilding={hoveredBuilding}
                        setHoveredBuilding={setHoveredBuilding}
                        onSelectBuilding={handleSelectBuilding}
                    />
                ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.9)", borderBottom: "1px solid #ccc", zIndex: 10 }}>
                            <Typography variant="h5" sx={{ color: "#14161A" }}>
                                {currentBuilding ? currentBuilding.name : `Корпус ${selectedBuilding}`}, Этаж {selectedFloor || " "}
                            </Typography>
                        </Box>

                        {selectedFloor && (
                            <InteractiveMap
                                bgImage={floorImage}
                                onDimensionsLoad={(w, h) => setCurrentMapSize({ width: w, height: h })}
                            >
                                <RoomLabels
                                    selectedFloor={selectedFloor}
                                    mapWidth={currentMapSize.width}
                                    mapHeight={currentMapSize.height}
                                    onRoomClick={(room: { name: string }) => console.log(room.name)}
                                />
                            </InteractiveMap>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default DesktopLayout;