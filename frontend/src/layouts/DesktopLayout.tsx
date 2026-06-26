import {Box, Typography} from "@mui/material";
import SideBar from "../components/SideBar.tsx";
import InteractiveMap from "../components/InteractiveMap.tsx";
import {useAppDispatch} from "../store/store.ts";
import {useEffect} from "react";
import {fetchAllBuildings} from "../store/buildingSlice.ts";

interface DesktopLayoutProps {
    selectedBuilding: string | null;
    selectedFloor: number | null;
    hoveredBuilding: string | null;
    setHoveredBuilding: (id: string | null) => void;
    setSelectedFloor: (floor: number | null) => void;
    handleSelectBuilding: (buildingId: string) => void;
    handleBackToGlobalMap: () => void;
}

function DesktopLayout({
                           selectedBuilding,
                           selectedFloor,
                           hoveredBuilding,
                           setHoveredBuilding,
                           setSelectedFloor,
                           handleSelectBuilding,
                           handleBackToGlobalMap,
                       }: DesktopLayoutProps) {

    const dispatch = useAppDispatch();


    useEffect(() => {
        dispatch(fetchAllBuildings());
    }, [dispatch]);

    return (
        <Box sx={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>

            <SideBar
                selectedBuilding={selectedBuilding}
                hoveredBuilding={hoveredBuilding}
                setHoveredBuilding={setHoveredBuilding}
                handleSelectBuilding={handleSelectBuilding}
                onChangeFloor={(floor) => setSelectedFloor(floor)}
                onBackToMap={handleBackToGlobalMap}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: "100%",
                    width: "100%",
                    position: "relative",
                }}
            >

                {selectedBuilding === null ? (

                    <InteractiveMap bgImage="/src/assets/campus_base.png">
                        <polygon
                            points="200,695 475,690 475,725 200,728"
                            fill={hoveredBuilding === "5" ? "rgba(25, 118, 210, 0.4)" : "rgba(25, 118, 210, 0.15)"}
                            stroke="#1976d2"
                            strokeWidth={hoveredBuilding === "5" ? 3 : 1.5}
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() => setHoveredBuilding("5")}
                            onMouseLeave={() => setHoveredBuilding(null)}
                            onClick={() => handleSelectBuilding("5")}
                        />
                        <text x="300" y="714" fill="#1976d2" fontWeight="bold">
                            Корпус №5
                        </text>
                    </InteractiveMap>

                ) : (

                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.9)", borderBottom: "1px solid #ccc", zIndex: 10 }}>
                            <Typography variant="h5">Корпус №{selectedBuilding}, Этаж {selectedFloor}</Typography>
                        </Box>

                        <InteractiveMap bgImage={`/src/assets/floors/building_${selectedBuilding}_floor_${selectedFloor}.png`}>
                            <circle cx="100" cy="150" r="15" fill="green" style={{ cursor: 'pointer' }} onClick={() => alert('Аудитория 501')} />
                            <text x="100" y="145" textAnchor="middle">501</text>
                        </InteractiveMap>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default DesktopLayout;