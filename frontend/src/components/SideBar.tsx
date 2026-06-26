import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Divider, Button, CircularProgress } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppSelector } from "../store/store"; // Твой кастомный TS хук

const DRAWER_WIDTH = 400;

interface SideBarProps {
    selectedBuilding: string | null;
    hoveredBuilding: string | null;
    setHoveredBuilding: (id: string | null) => void;
    handleSelectBuilding: (buildingId: string) => void;
    onChangeFloor: (floor: number) => void;
    onBackToMap: () => void;
}

export default function SideBar({
                                    selectedBuilding,
                                    hoveredBuilding,
                                    setHoveredBuilding,
                                    handleSelectBuilding,
                                    onChangeFloor,
                                    onBackToMap,
                                }: SideBarProps) {

    const { buildings, loading, selectedFloor } = useAppSelector((state) => state.building);

    const staticFutureBuildings = [
        { id: "1", name: "1-й Главный корпус" },
        { id: "2", name: "2-й Гуманитарный корпус" },
    ];



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
                    borderRight: "1px solid rgba(255, 255, 255, 0.08)"
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: "#F0F2F5", fontWeight: 600 }}>
                    Навигатор ВУЗа
                </Typography>
                <Typography variant="caption" sx={{ color: "#90949C", display: "block", mt: 0.5 }}>
                    {selectedBuilding
                        ? `Корпус №${selectedBuilding} — Этаж ${selectedFloor}`
                        : "Выберите корпус на карте или в списке"}
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
                                <BusinessIcon sx={{ mr: 2, color: "#2F80ED" }} />
                                <ListItemText
                                    primary={b.name}
                                    secondary="Планы этажей готовы"
                                    slotProps={{
                                        primary: { style: { color: "#E4E6EB", fontWeight: 500 } },
                                        secondary: { style: { color: "#00B074", marginTop: "2px" } }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}

                    {staticFutureBuildings
                        .filter(fb => !buildings.some(b => b.id === fb.id))
                        .map((b) => (
                            <ListItem key={b.id} disablePadding>
                                <ListItemButton
                                    disabled
                                    sx={{ py: 1.5, "&.Mui-disabled": { opacity: 0.35 } }}
                                >
                                    <BusinessIcon sx={{ mr: 2, color: "#4E5156" }} />
                                    <ListItemText
                                        primary={b.name}
                                        secondary="В разработке"
                                        slotProps={{
                                            primary: { style: { color: "#90949C", fontWeight: 500 } },
                                            secondary: { style: { color: "#4E5156", marginTop: "2px" } }
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
                        {[1, 2, 3, 4].map((floor) => {
                            const isSelected = selectedFloor === floor;
                            return (
                                <Button
                                    key={floor}
                                    variant={isSelected ? "contained" : "text"}
                                    onClick={() => onChangeFloor(floor)}
                                    sx={{
                                        minWidth: "76px",
                                        padding: "8px 0",
                                        backgroundColor: isSelected ? "#2F80ED" : "rgba(255, 255, 255, 0.05)",
                                        color: isSelected ? "#FFFFFF" : "#E4E6EB",
                                        textTransform: "none",
                                        fontWeight: isSelected ? 600 : 400,
                                        "&:hover": {
                                            backgroundColor: isSelected ? "#1B6FD1" : "rgba(255, 255, 255, 0.1)"
                                        }
                                    }}
                                >
                                    {floor} эт.
                                </Button>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}