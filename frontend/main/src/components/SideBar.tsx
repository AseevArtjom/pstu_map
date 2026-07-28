import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography,
    Divider, Button, CircularProgress, TextField, InputAdornment, IconButton,
    Autocomplete
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppDispatch, useAppSelector } from "../store/store";
import BuildingIcon from "./EntityIcon.tsx";
import { useEffect, useMemo, useState } from "react";
import { Clear, Search, DirectionsWalk, SwapVert } from "@mui/icons-material";
import StairsOutlined from "@mui/icons-material/StairsOutlined";
import ElevatorOutlined from "@mui/icons-material/ElevatorOutlined";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EntityIcon from "./EntityIcon.tsx";
import { calculateRoute, clearCalculatedPath } from "../store/mapSlice.ts";
import logoImg from "../assets/Pstu-logo.png";

const autocompleteSlotProps = {
    paper: {
        sx: {
            bgcolor: '#15161A',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E4E6EB',
        }
    },
    listbox: {
        sx: {
            '& .MuiAutocomplete-option': {
                fontSize: '14px',
                color: '#E4E6EB',
            },
            '& .MuiAutocomplete-option.Mui-focused': {
                bgcolor: 'rgba(47, 128, 237, 0.15)',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
                bgcolor: 'rgba(47, 128, 237, 0.25)',
            },
        }
    },
    clearIndicator: {
        sx: { color: 'rgba(255,255,255,0.5)' }
    },
    popupIndicator: {
        sx: { color: 'rgba(255,255,255,0.5)' }
    },
};

const DRAWER_WIDTH = 400;

interface SideBarProps {
    selectedBuilding: number | null;
    hoveredBuilding: number | null;
    setHoveredBuilding: (id: number | null) => void;
    handleSelectBuilding: (buildingId: number) => void;
    onChangeFloor: (floor: number) => void;
    onBackToMap: () => void;
    availableFloors: number[];
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    hoveredRoomId?: string | null;
    setHoveredRoomId?: (id: string | null) => void;
}

const scrollbarStyles = {
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: "10px" },
    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
};

const routeInputStyle = {
    "& .MuiOutlinedInput-root": {
        color: "#E4E6EB",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
        "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.25)" },
        "&.Mui-focused fieldset": { borderColor: "#2F80ED" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
};

export default function SideBar({
                                    selectedBuilding, hoveredBuilding, setHoveredBuilding, handleSelectBuilding,
                                    onChangeFloor, onBackToMap, availableFloors, searchQuery, onSearchQueryChange,
                                    hoveredRoomId, setHoveredRoomId
                                }: SideBarProps) {
    const dispatch = useAppDispatch();
    const { buildings, loading, selectedFloor } = useAppSelector((state) => state.building);
    const { rooms } = useAppSelector((state) => state.room);
    const { calculatedPath, pathSteps, routeLoading, error } = useAppSelector((state) => state.map);

    const [fromRoomId, setFromRoomId] = useState<string | null>(null);
    const [toRoomId, setToRoomId] = useState<string | null>(null);

    useEffect(() => {
        onSearchQueryChange?.("");
    }, [selectedBuilding, onSearchQueryChange]);

    useEffect(() => {
        setFromRoomId(null);
        setToRoomId(null);
        dispatch(clearCalculatedPath());
    }, [selectedBuilding, dispatch]);

    const filteredBuildings = useMemo(() => {
        if (selectedBuilding != null) return [];
        return buildings.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [buildings, searchQuery, selectedBuilding]);

    const filteredRooms = useMemo(() => {
        if (selectedBuilding === null || !selectedFloor) return [];
        return rooms.filter((room) =>
            room.floor === selectedFloor &&
            room.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rooms, selectedBuilding, selectedFloor, searchQuery]);

    const navigableRooms = useMemo(() => {
        return rooms.filter((room) => room.node?.id);
    }, [rooms]);

    const handleBuildRoute = async () => {
        if (!fromRoomId || !toRoomId) return;
        const fromRoom = rooms.find(r => r.id === fromRoomId);
        await dispatch(calculateRoute({ fromRoomId, toRoomId })).unwrap();

        if (fromRoom) {
            onChangeFloor(fromRoom.floor);
        }
    };

    const routeFloors = useMemo(() => {
        return new Set(calculatedPath.map(n => n.floor));
    }, [calculatedPath]);

    const handleSwap = () => {
        setFromRoomId(toRoomId);
        setToRoomId(fromRoomId);
    };

    const stepLabel = (step: typeof pathSteps[number]) => {
        if (step.type === "elevator") {
            return `На лифте: этаж ${step.fromFloor} → этаж ${step.toFloor}`;
        }
        if (step.type === "stairs") {
            const direction = step.toFloor > step.fromFloor ? "Подняться" : "Спуститься";
            return `${direction} по лестнице: этаж ${step.fromFloor} → этаж ${step.toFloor}`;
        }
        return `Пройти по этажу ${step.fromFloor}`;
    };

    const stepIcon = (type: string) => {
        if (type === "elevator") return <ElevatorOutlined sx={{ fontSize: 16, color: "#9C27B0" }} />;
        if (type === "stairs") return <StairsOutlined sx={{ fontSize: 16, color: "#4CAF50" }} />;
        return <DirectionsWalk sx={{ fontSize: 16, color: "#2F80ED" }} />;
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: DRAWER_WIDTH,
                    boxSizing: "border-box",
                    backgroundColor: "#14161A",
                    color: "#E4E6EB",
                    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                    ...scrollbarStyles,
                    overflowY: "auto",
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}
            >
                <Box
                    component="img"
                    src={logoImg}
                    alt="Логотип ПГТУ"
                    sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'contain',
                        filter: 'brightness(0) invert(1)',
                        opacity: 0.9
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        color: "#F0F2F5",
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: '0.3px'
                    }}
                >
                    Навигатор ПГТУ
                </Typography>
            </Box>

            <Box sx={{ px: 2, pb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={selectedBuilding === null ? "Поиск корпусов..." : "Поиск кабинетов..."}
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange?.(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: "rgba(255, 255, 255, 0.3)" }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => onSearchQueryChange?.("")} size="small" edge="end" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                    sx={routeInputStyle}
                />
            </Box>

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

            {selectedBuilding === null ? (
                <List sx={{ pt: 1 }}>
                    {loading && buildings.length === 0 && (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                            <CircularProgress size={24} sx={{ color: "#2F80ED" }} />
                        </Box>
                    )}

                    {filteredBuildings.map((b) => (
                        <ListItem key={b.id} disablePadding>
                            <ListItemButton
                                selected={hoveredBuilding === b.id}
                                onMouseEnter={() => setHoveredBuilding(b.id)}
                                onMouseLeave={() => setHoveredBuilding(null)}
                                onClick={() => handleSelectBuilding(b.id)}
                                sx={{
                                    py: 1.5,
                                    "&.Mui-selected": {
                                        backgroundColor: "rgba(47, 128, 237, 0.15)",
                                        "&:hover": { backgroundColor: "rgba(47, 128, 237, 0.25)" }
                                    },
                                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" }
                                }}
                            >
                                <BuildingIcon iconPath={b.icon_path} iconColor={b.hex_color} />
                                <ListItemText
                                    primary={b.name}
                                    secondary="Планы этажей готовы"
                                    sx={{ marginLeft: "16px" }}
                                    slotProps={{
                                        primary: { style: { color: "#E4E6EB", fontWeight: 500 } },
                                        secondary: { style: { color: "#00B074", marginTop: "2px" } }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}

                    {!loading && filteredBuildings.length === 0 && (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                            <Typography sx={{ color: "#90949C", fontSize: "14px" }}>Корпуса не найдены</Typography>
                        </Box>
                    )}
                </List>
            ) : (
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onBackToMap}
                        sx={{
                            color: "#E4E6EB", borderColor: "rgba(255, 255, 255, 0.15)", textTransform: "none", mb: 3,
                            "&:hover": { borderColor: "rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.04)" }
                        }}
                    >
                        На общую карту
                    </Button>

                    <Typography sx={{ mb: 1.5, color: "#90949C", fontWeight: 500 }} variant="subtitle2">
                        Выбор этажа:
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                        {[...availableFloors].sort((a, b) => a - b).map((floor) => {
                            const isFloorSelected = Number(selectedFloor) === floor;
                            const isOnRoute = routeFloors.has(floor);
                            return (
                                <Button
                                    key={floor}
                                    variant={isFloorSelected ? "contained" : "text"}
                                    onClick={() => onChangeFloor(floor)}
                                    sx={{
                                        minWidth: "76px", padding: "8px 0", textTransform: "none",
                                        fontWeight: isFloorSelected ? 600 : 400,
                                        color: isFloorSelected ? "#FFFFFF !important" : "#E4E6EB",
                                        backgroundColor: isFloorSelected ? "#2F80ED !important" : "rgba(255, 255, 255, 0.05)",
                                        border: isOnRoute && !isFloorSelected ? "1.5px solid #2F80ED" : "1.5px solid transparent",
                                        "&:hover": { backgroundColor: isFloorSelected ? "#1B6FD1 !important" : "rgba(255, 255, 255, 0.1)" }
                                    }}
                                >
                                    {floor} эт.
                                </Button>
                            );
                        })}
                        {availableFloors.length === 0 && (
                            <Typography sx={{ color: "#90949C", fontSize: "13px", fontStyle: "italic" }}>
                                Планы этажей отсутствуют
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", my: 1 }} />

                    <Typography sx={{ mt: 2, mb: 1.5, color: "#90949C", fontWeight: 500 }} variant="subtitle2">
                        Построить маршрут:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Autocomplete
                            options={navigableRooms}
                            getOptionLabel={(room) => room.name}
                            value={navigableRooms.find(r => r.id === fromRoomId) || null}
                            onChange={(_, value) => setFromRoomId(value?.id ?? null)}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            slotProps={autocompleteSlotProps}
                            renderInput={(params) => (
                                <TextField {...params} label="Откуда" size="small" sx={routeInputStyle} />
                            )}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                                size="small"
                                onClick={handleSwap}
                                sx={{ color: "rgba(255,255,255,0.5)", '&:hover': { color: '#2F80ED' } }}
                            >
                                <SwapVert fontSize="small" />
                            </IconButton>
                        </Box>

                        <Autocomplete
                            options={navigableRooms}
                            getOptionLabel={(room) => room.name}
                            value={navigableRooms.find(r => r.id === toRoomId) || null}
                            onChange={(_, value) => setToRoomId(value?.id ?? null)}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            slotProps={autocompleteSlotProps}
                            renderInput={(params) => (
                                <TextField {...params} label="Куда" size="small" sx={routeInputStyle} />
                            )}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!fromRoomId || !toRoomId || routeLoading}
                            onClick={handleBuildRoute}
                            sx={{
                                bgcolor: '#2F80ED', textTransform: 'none', fontWeight: 600,
                                '&:hover': { bgcolor: '#1B6FD1' },
                                '&.Mui-disabled': { bgcolor: 'rgba(47,128,237,0.15)', color: 'rgba(255,255,255,0.4)' }
                            }}
                        >
                            {routeLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : "Построить маршрут"}
                        </Button>

                        {error && (
                            <Typography sx={{ color: '#F44336', fontSize: '13px' }}>{error}</Typography>
                        )}

                        {calculatedPath.length > 0 && (
                            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(47,128,237,0.08)', borderRadius: '8px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#E4E6EB' }}>
                                        Маршрут ({pathSteps.filter(s => s.type !== 'corridor').length} перех.)
                                    </Typography>
                                    <Button
                                        size="small"
                                        onClick={() => dispatch(clearCalculatedPath())}
                                        sx={{
                                            backgroundColor: "#F44336",
                                            minWidth: 'auto',
                                            p: 0.5,
                                            height: "25px",
                                            width: "80px"
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "10px",fontWeight: 600, color: '#E4E6EB'}}>
                                            Сбросить
                                        </Typography>
                                    </Button>
                                </Box>

                                {pathSteps
                                    .filter(s => s.type !== 'corridor')
                                    .map((step, i) => (
                                        <Box
                                            key={`${step.fromNodeId}-${step.toNodeId}-${i}`}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, cursor: 'pointer' }}
                                            onClick={() => onChangeFloor(step.toFloor)}
                                        >
                                            {stepIcon(step.type)}
                                            <Typography sx={{ fontSize: '12px', color: '#C4C7CC' }}>
                                                {stepLabel(step)}
                                            </Typography>
                                        </Box>
                                    ))}

                                {pathSteps.filter(s => s.type !== 'corridor').length === 0 && (
                                    <Typography sx={{ fontSize: '12px', color: '#90949C', fontStyle: 'italic' }}>
                                        Маршрут проходит в пределах одного этажа
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", my: 2 }} />

                    <Typography sx={{ mb: 1.5, color: "#90949C", fontWeight: 500 }} variant="subtitle2">
                        Кабинеты на этаже ({filteredRooms.length}):
                    </Typography>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', ...scrollbarStyles }}>
                        <List sx={{ pt: 0 }}>
                            {filteredRooms.map((room) => {
                                const roomIconPath = room.customIconPath || null;
                                const roomColor = room.customColor || room.roomType?.defaultColor || "#2F80ED";

                                return (
                                    <ListItem key={room.id} disablePadding>
                                        <ListItemButton
                                            selected={hoveredRoomId === room.id}
                                            onMouseEnter={() => setHoveredRoomId?.(room.id)}
                                            onMouseLeave={() => setHoveredRoomId?.(null)}
                                            sx={{
                                                borderRadius: '6px', mb: 0.5,
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(47, 128, 237, 0.15)",
                                                    "&:hover": { backgroundColor: "rgba(47, 128, 237, 0.25)" }
                                                },
                                                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" }
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", mr: 1.5 }}>
                                                {roomIconPath ? (
                                                    <EntityIcon iconPath={roomIconPath} iconColor={roomColor} />
                                                ) : (
                                                    <MeetingRoomIcon sx={{ color: roomColor, fontSize: 20 }} />
                                                )}
                                            </Box>
                                            <ListItemText
                                                primary={room.name}
                                                secondary={room.description || "Без описания"}
                                                slotProps={{
                                                    primary: { style: { color: "#E4E6EB", fontSize: "14px", fontWeight: 500 } },
                                                    secondary: { style: { color: "#90949C", fontSize: "12px" } }
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                            {filteredRooms.length === 0 && (
                                <Typography sx={{ color: "#90949C", fontSize: "13px", fontStyle: "italic", textAlign: "center", mt: 2 }}>
                                    Ничего не найдено
                                </Typography>
                            )}
                        </List>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}