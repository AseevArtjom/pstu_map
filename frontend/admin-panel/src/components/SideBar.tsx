import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Divider,
    Button,
    CircularProgress, TextField, InputAdornment, IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppSelector} from "../store/store";
import BuildingIcon from "./EntityIcon.tsx";
import {useEffect, useMemo} from "react";
import {Clear, Search} from "@mui/icons-material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EntityIcon from "./EntityIcon.tsx";

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
    "&::-webkit-scrollbar": {
        width: "6px",
    },
    "&::-webkit-scrollbar-track": {
        background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
};

export default function SideBar({
    selectedBuilding,
    hoveredBuilding,
    setHoveredBuilding,
    handleSelectBuilding,
    onChangeFloor,
    onBackToMap,
    availableFloors,
    searchQuery,
    onSearchQueryChange,
    hoveredRoomId,
    setHoveredRoomId
}: SideBarProps) {

    const { buildings, loading, selectedFloor } = useAppSelector((state) => state.building);
    const { rooms } = useAppSelector((state) => state.room);

    useEffect(() => {
        onSearchQueryChange?.("");
    }, [selectedBuilding,onSearchQueryChange]);

    const filteredBuildings = useMemo(() => {
        if (selectedBuilding != null) return [];
        return buildings.filter((b) =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [buildings, searchQuery, selectedBuilding]);

    const filteredRooms = useMemo(() => {
        if (selectedBuilding === null || !selectedFloor) return [];
        return rooms.filter((room) =>
            room.floor === selectedFloor &&
            room.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rooms, selectedBuilding, selectedFloor, searchQuery]);

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
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: "#F0F2F5", fontWeight: 600 }}>
                    Админ панель
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
                                    <IconButton
                                        onClick={() => onSearchQueryChange?.("")}
                                        size="small"
                                        edge="end"
                                        sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                                    >
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "#E4E6EB",
                            backgroundColor: "rgba(255, 255, 255, 0.04)",
                            "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.12)",
                            },
                            "&:hover fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.25)",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#2F80ED",
                            },
                        },
                    }}
                />
            </Box>

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

            {selectedBuilding === null ? (
                /* СПИСОК КОРПУСОВ */
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
                                <BuildingIcon iconPath={b.icon_path} iconColor={b.hex_color}/>

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
                            <Typography sx={{ color: "#90949C", fontSize: "14px" }}>
                                Корпуса не найдены
                            </Typography>
                        </Box>
                    )}
                </List>
            ) : (
                /* ЭКРАН ВНУТРИ КОРПУСА */
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onBackToMap}
                        sx={{
                            color: "#E4E6EB",
                            borderColor: "rgba(255, 255, 255, 0.15)",
                            textTransform: "none",
                            mb: 3,
                            "&:hover": {
                                borderColor: "rgba(255, 255, 255, 0.3)",
                                backgroundColor: "rgba(255, 255, 255, 0.04)"
                            }
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
                            return (
                                <Button
                                    key={floor}
                                    variant={isFloorSelected ? "contained" : "text"}
                                    onClick={() => onChangeFloor(floor)}
                                    sx={{
                                        minWidth: "76px",
                                        padding: "8px 0",
                                        textTransform: "none",
                                        fontWeight: isFloorSelected ? 600 : 400,
                                        color: isFloorSelected ? "#FFFFFF !important" : "#E4E6EB",
                                        backgroundColor: isFloorSelected ? "#2F80ED !important" : "rgba(255, 255, 255, 0.05)",
                                        "&:hover": {
                                            backgroundColor: isFloorSelected ? "#1B6FD1 !important" : "rgba(255, 255, 255, 0.1)"
                                        }
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

                    {/* СПИСОК КАБИНЕТОВ ТЕКУЩЕГО ЭТАЖА */}
                    <Typography sx={{ mt: 2, mb: 1.5, color: "#90949C", fontWeight: 500 }} variant="subtitle2">
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
                                            onClick={() => {
                                                console.log("Выбран кабинет из списка:", room.name);
                                            }}
                                            sx={{
                                                borderRadius: '6px',
                                                mb: 0.5,
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(47, 128, 237, 0.15)",
                                                    "&:hover": { backgroundColor: "rgba(47, 128, 237, 0.25)" }
                                                },
                                                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" }
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", mr: 1.5 }}>
                                                {roomIconPath ? (
                                                    <EntityIcon
                                                        iconPath={roomIconPath}
                                                        iconColor={roomColor}
                                                    />
                                                ) : (
                                                    <MeetingRoomIcon
                                                        sx={{ color: roomColor, fontSize: 20 }}
                                                    />
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