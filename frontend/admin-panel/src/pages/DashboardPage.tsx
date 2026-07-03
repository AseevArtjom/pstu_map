import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import SideBar from "../components/SideBar";
import InteractiveMap from "../components/InteractiveMap";
import RoomLabels from "../components/RoomLabels.tsx";
import ContextMenu from "../components/ContextMenu";
import BuildingDrawingLayer from "../components/BuildingDrawingLayer";

import { useAppDispatch, useAppSelector } from "../store/store.ts";
import {deleteBuilding, fetchAllBuildings, setSelectedFloor, updateBuilding} from "../store/buildingSlice.ts";
import { fetchRoomsByBuilding } from "../store/roomSlice.ts";
import { fetchFloorsByBuilding } from "../store/floorPlanSlice.ts";
import { BASE_URL } from "../http.ts";
import { useAuthService } from "../hooks/useAuthService.ts";
import {formatPoints, parsePoints, useBuildingConstructor} from "../hooks/useBuildingConstructor.ts";
import { usePolygonColors } from "../hooks/usePolygonColors.ts";

import campusBaseImg from "@shared/assets/campus_base.png";
import SaveBuildingModal from "../modal/SaveBuildingModal.tsx";

interface MapPolygonProps {
    building: any;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
}

function MapPolygon({ building, isHovered, onMouseEnter, onMouseLeave, onClick }: MapPolygonProps) {
    const colors = usePolygonColors(building.hex_color, isHovered);

    return (
        <polygon
            points={building.mapPolygon}
            data-building-id={building.id}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={isHovered ? 2.5 : 1.5}
            style={{
                cursor: "pointer",
                transition: "all 0.15s ease",
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        />
    );
}

export default function DashboardPage() {
    const { logout, checkHasRole } = useAuthService();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const dispatch = useAppDispatch();

    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<number | null>(null);
    const [currentMapSize, setCurrentMapSize] = useState({ width: 805, height: 780 });

    const constructor = useBuildingConstructor(currentMapSize, selectedBuilding);

    const { buildings, selectedFloor } = useAppSelector((state) => state.building);
    const { floors } = useAppSelector((state) => state.floorPlan);
    const currentBuilding = buildings.find(b => b.id === constructor.editingId);

    useEffect(() => {
        (async () => {
            const hasAdminRole = await checkHasRole('admin');
            setIsAdmin(hasAdminRole);
        })();
    }, [checkHasRole]);

    useEffect(() => {
        if (isAdmin) dispatch(fetchAllBuildings());
    }, [isAdmin, dispatch]);

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


    const handleDimensionsLoad = useCallback((w: number, h: number) => {
        setCurrentMapSize({ width: w, height: h });
    }, []);

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
    const bgMapImage = selectedBuilding === null
        ? campusBaseImg
        : (currentFloorPlan ? `${BASE_URL}${currentFloorPlan.imagePath}` : `/src/assets/floors/building_${selectedBuilding}_floor_${selectedFloor}.png`);

    return (
        <Box
            onMouseUp={constructor.handleMapMouseUp}
            sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}
        >
            <SideBar
                selectedBuilding={selectedBuilding}
                hoveredBuilding={hoveredBuilding}
                setHoveredBuilding={setHoveredBuilding}
                handleSelectBuilding={(id) => setSelectedBuilding(id)}
                onChangeFloor={(floor) => dispatch(setSelectedFloor(floor))}
                onBackToMap={() => setSelectedBuilding(null)}
                availableFloors={floors.map(f => f.floorNumber)}
            />

            <Box
                ref={constructor.mapContainerRef}
                onContextMenu={constructor.handleContextMenu}
                onMouseMove={constructor.handleMapMouseMove}
                onDoubleClick={constructor.handleMapDoubleClick}
                sx={{
                    flexGrow: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
                    cursor: constructor.isDrawingMode ? 'crosshair' : 'default'
                }}
            >
                {constructor.isDrawingMode && (
                    <Box sx={{ p: 1.5, bgcolor: "#2F80ED", color: "#fff", zIndex: 10, textAlign: 'center', boxShadow: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Двойной клик ЛКМ — создать новую точку. Зажмите ЛКМ на точке, чтобы двигать её. (Enter — сохранить, Esc — отмена)
                        </Typography>
                    </Box>
                )}

                {selectedBuilding !== null && (
                    <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.9)", borderBottom: "1px solid #ccc", zIndex: 10 }}>
                        <Typography variant="h5" sx={{ color: "#14161A" }}>
                            {currentBuilding ? currentBuilding.name : `Корпус ${selectedBuilding}`}, Этаж {selectedFloor || " "}
                        </Typography>
                    </Box>
                )}

                {selectedBuilding === null ? (
                    <InteractiveMap
                        bgImage={campusBaseImg}
                        isGlobalMap={true}
                        hoveredBuilding={hoveredBuilding}
                        setHoveredBuilding={setHoveredBuilding}
                        onSelectBuilding={(id) => setSelectedBuilding(id)}
                        onDimensionsLoad={handleDimensionsLoad}
                        isDrawingMode={constructor.isDrawingMode}
                    >
                        {!constructor.isDrawingMode && buildings.map((b) => (
                            <MapPolygon
                                key={b.id}
                                building={b}
                                isHovered={hoveredBuilding === b.id}
                                onMouseEnter={() => setHoveredBuilding(b.id)}
                                onMouseLeave={() => setHoveredBuilding(null)}
                                onClick={() => setSelectedBuilding(b.id)}
                            />
                        ))}

                        {constructor.isDrawingMode && (
                            <BuildingDrawingLayer
                                mapSize={currentMapSize}
                                polygonPoints={constructor.polygonPoints}
                                tempPointsString={constructor.tempPointsString}
                                tempPoint={constructor.tempPoint}
                                draggedPointIndex={constructor.draggedPointIndex}
                                onPointMouseDown={constructor.handlePointMouseDown}
                                onPointContextMenu={constructor.handlePointContextMenu}
                            />
                        )}
                    </InteractiveMap>
                ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        {selectedFloor && (
                            <InteractiveMap bgImage={bgMapImage} onDimensionsLoad={handleDimensionsLoad}>
                                <RoomLabels
                                    selectedFloor={selectedFloor}
                                    mapWidth={currentMapSize.width}
                                    mapHeight={currentMapSize.height}
                                    onRoomClick={(room) => console.log(room.name)}
                                />
                            </InteractiveMap>
                        )}
                    </Box>
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

            <ContextMenu
                mouseX={constructor.contextMenu.mouseX}
                mouseY={constructor.contextMenu.mouseY}
                targetType={constructor.contextMenu.targetType}
                targetId={constructor.contextMenu.targetId}
                onClose={constructor.handleCloseContextMenu}
                onAddBuilding={constructor.startDrawingMode}
                onEditBuilding={(id) => {
                    const building = buildings.find(b => b.id === id);
                    if (building && building.mapPolygon) {
                        const points = parsePoints(building.mapPolygon);
                        constructor.setPointsFromExternal(points, id);
                    }
                }}
                onDeleteBuilding={(id) => {
                    if (window.confirm('Вы уверены, что хотите удалить этот корпус?')) {
                        dispatch(deleteBuilding(id));
                    }
                }}
            />

            <SaveBuildingModal
                open={constructor.isSaveModalOpen}
                onClose={() => constructor.setIsSaveModalOpen(false)}
                points={constructor.polygonPoints}
                initialData={constructor.isEditing && currentBuilding ? {
                    id: currentBuilding.id,
                    name: currentBuilding.name,
                    hexColor: currentBuilding.hex_color,
                    icon: currentBuilding.icon_path || null
                } : null}
                onSave={(name, hexColor, icon, lengthM, depthM) => {
                    if (constructor.isEditing && constructor.editingId) {
                        dispatch(updateBuilding({
                            id: constructor.editingId,
                            name,
                            hex_color: hexColor,
                            icon,
                            lengthM,
                            depthM,
                            mapPolygon: formatPoints(constructor.polygonPoints)
                        }));
                        constructor.resetDrawing();
                    } else {
                        constructor.handleSaveBuilding(name, hexColor, icon, lengthM, depthM);
                    }
                }}
            />
        </Box>
    );
}