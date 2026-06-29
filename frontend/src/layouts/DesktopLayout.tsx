import {Box, Typography} from "@mui/material";
import SideBar from "../components/SideBar.tsx";
import InteractiveMap from "../components/InteractiveMap.tsx";
import {useAppDispatch, useAppSelector} from "../store/store.ts";
import {useEffect, useState} from "react";
import {fetchAllBuildings, setSelectedFloor} from "../store/buildingSlice.ts";
import RoomLabels from "../components/RoomLabels.tsx";
import {fetchRoomsByBuilding} from "../store/roomSlice.ts";

interface DesktopLayoutProps {
    selectedBuilding: string | null;
    hoveredBuilding: string | null;
    setHoveredBuilding: (id: string | null) => void;
    handleSelectBuilding: (buildingId: string) => void;
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

    const currentBuilding = buildings.find(b => b.id === selectedBuilding);

    const [currentMapSize, setCurrentMapSize] = useState({ width: 805, height: 780 });

    useEffect(() => {
        dispatch(fetchAllBuildings());
    }, [dispatch]);

    useEffect(() => {
        if (selectedBuilding) {
            dispatch(fetchRoomsByBuilding(selectedBuilding));
        }
    }, [selectedBuilding, dispatch]);

    return (
        <Box sx={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>

            <SideBar
                selectedBuilding={selectedBuilding}
                hoveredBuilding={hoveredBuilding}
                setHoveredBuilding={setHoveredBuilding}
                handleSelectBuilding={handleSelectBuilding}
                onChangeFloor={(floor) => dispatch(setSelectedFloor(floor))}
                onBackToMap={handleBackToGlobalMap}
            />

            <Box component="main" sx={{ flexGrow: 1, height: "100%", width: "100%", position: "relative" }}>

                {selectedBuilding === null ? (
                    <InteractiveMap
                        bgImage="/src/assets/campus_base.png"
                        isGlobalMap={true}
                        hoveredBuilding={hoveredBuilding}
                        setHoveredBuilding={setHoveredBuilding}
                        onSelectBuilding={handleSelectBuilding}
                    />

                ) : (

                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.9)", borderBottom: "1px solid #ccc", zIndex: 10 }}>
                            <Typography variant="h5">
                                {currentBuilding ? currentBuilding.name : `Корпус ${selectedBuilding}`}, Этаж {selectedFloor}
                            </Typography>
                        </Box>

                        <InteractiveMap
                            bgImage={`/src/assets/floors/building_${selectedBuilding}_floor_${selectedFloor}.png`}
                            onDimensionsLoad={(w, h) => setCurrentMapSize({ width: w, height: h })}
                        >
                            <RoomLabels
                                selectedFloor={selectedFloor}
                                mapWidth={currentMapSize.width}
                                mapHeight={currentMapSize.height}
                                onRoomClick={(room) => console.log(room.name)}
                            />
                        </InteractiveMap>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default DesktopLayout;