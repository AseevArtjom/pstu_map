import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import SideBar from "../components/SideBar";
import InteractiveMap from "../components/InteractiveMap";
import BuildingContextMenu from "../components/context/BuildingContextMenu.tsx";
import PolygonDrawingLayer from "../components/layer/PolygonDrawingLayer.tsx";

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
import { BASE_URL } from "../http.ts";
import { useAuthService } from "../hooks/useAuthService.ts";
import {parsePoints, usePolygonConstructor} from "../hooks/usePolygonConstructor.ts";
import campusBaseImg from "@shared/assets/campus_base.png";
import AddBuildingStep from "../modal/building/AddBuildingStep.tsx";
import FloorPage from "./FloorPage.tsx";
import MapPolygon from "../components/MapPolygon.tsx";

export default function DashboardPage() {
    const { logout, checkHasRole } = useAuthService();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const dispatch = useAppDispatch();

    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<number | null>(null);

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

    const { buildings, selectedFloor } = useAppSelector((state) => state.building);
    const { floors } = useAppSelector((state) => state.floorPlan);
    const currentBuilding = buildings.find(b => b.id === buildingConstructor.editingId);

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
    const bgMapImage = currentFloorPlan
        ? `${BASE_URL}${currentFloorPlan.imagePath}`
        : "";

    return (
        <Box
            onMouseUp={buildingConstructor.handleMapMouseUp}
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
                ref={buildingConstructor.mapContainerRef}
                onContextMenu={(e) =>{
                    if(selectedBuilding === null) {
                        buildingConstructor.handleContextMenu(e);
                    }
                }}
                onMouseMove={buildingConstructor.handleMapMouseMove}
                onDoubleClick={buildingConstructor.handleMapDoubleClick}
                sx={{
                    flexGrow: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
                    cursor: buildingConstructor.isDrawingMode ? 'crosshair' : 'default'
                }}
            >
                {buildingConstructor.isDrawingMode && (
                    <Box sx={{ p: 1.5, bgcolor: "#2F80ED", color: "#fff", zIndex: 10, textAlign: 'center', boxShadow: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Двойной клик ЛКМ — создать новую точку. Зажмите ЛКМ на точке, чтобы двигать её. (Enter — сохранить, Esc — отмена)
                        </Typography>
                    </Box>
                )}

                {selectedBuilding !== null && (
                    <Box sx={{ p: 2, bgcolor: "#14161A",borderBottom: "1px solid rgba(255, 255, 255, 0.08)"}}>
                        <Typography variant="h5" sx={{ color: "#fff",fontWeight: 500 }}>
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
                        onSelectBuilding={(id) => setSelectedBuilding(id)}
                        isDrawingMode={buildingConstructor.isDrawingMode}
                        editingId={buildingConstructor.editingId}
                    >
                        {!buildingConstructor.isDrawingMode && buildings.map((b) => (
                            <MapPolygon
                                key={b.id}
                                building={b}
                                isHovered={hoveredBuilding === b.id}
                                onMouseEnter={() => setHoveredBuilding(b.id)}
                                onMouseLeave={() => setHoveredBuilding(null)}
                                onClick={() => setSelectedBuilding(b.id)}
                            />
                        ))}

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
                    if (window.confirm('Вы уверены, что хотите удалить этот корпус?')) {
                        dispatch(deleteBuilding(id));
                    }
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
        </Box>
    );
}