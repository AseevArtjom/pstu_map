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
    CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppSelector} from "../store/store";
import BuildingIcon from "./BuildingIcon.tsx";

const DRAWER_WIDTH = 400;

interface SideBarProps {
    selectedBuilding: number | null;
    hoveredBuilding: number | null;
    setHoveredBuilding: (id: number | null) => void;
    handleSelectBuilding: (buildingId: number) => void;
    onChangeFloor: (floor: number) => void;
    onBackToMap: () => void;
    availableFloors: number[];
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
                                }: SideBarProps) {

    const { buildings, loading, selectedFloor } = useAppSelector((state) => state.building);

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

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

            {selectedBuilding === null ? (
                <List sx={{ pt: 1 }}>
                    {loading && buildings.length === 0 && (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                            <CircularProgress size={24} sx={{ color: "#2F80ED" }} />
                        </Box>
                    )}

                    {buildings.map((b) => (
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
                                    sx={{
                                        marginLeft: "16px"
                                    }}
                                    slotProps={{
                                        primary: { style: { color: "#E4E6EB", fontWeight: 500 } },
                                        secondary: { style: { color: "#00B074", marginTop: "2px" } }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Box sx={{ p: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={onBackToMap}
                        sx={{
                            color: "#E4E6EB",
                            borderColor: "rgba(255, 255, 255, 0.15)",
                            textTransform: "none",
                            "&:hover": {
                                borderColor: "rgba(255, 255, 255, 0.3)",
                                backgroundColor: "rgba(255, 255, 255, 0.04)"
                            }
                        }}
                    >
                        На общую карту
                    </Button>

                    <Typography sx={{ mt: 4, mb: 1.5, color: "#90949C", fontWeight: 500 }} variant="subtitle2">
                        Выбор этажа:
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                </Box>
            )}
        </Drawer>
    );
}