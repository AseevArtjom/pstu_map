import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    TextField,
    IconButton,
    Autocomplete,
    Alert
} from "@mui/material";
import { SwapVert, DirectionsWalk, Login } from "@mui/icons-material";
import StairsOutlined from "@mui/icons-material/StairsOutlined";
import ElevatorOutlined from "@mui/icons-material/ElevatorOutlined";

import { useAppDispatch, useAppSelector } from "../store/store";
import {
    calculateRoute,
    clearCalculatedPath,
    setFromOption,
    setToOption,
    swapRouteOptions,
    type RouteOption
} from "../store/mapSlice";
import { fetchNavigableRooms } from "../store/roomSlice";
import { fetchEntranceNode } from "../store/nodeSlice";
import type { Node } from "@shared/types/Node.ts";
import LogoutIcon from "@mui/icons-material/Logout";

interface RouteBuilderProps {
    onChangeFloor?: (floor: number) => void;
    onNavigateToStart?: (targetBuildingId: number | null, targetFloor: number | null) => void;
}

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
    clearIndicator: { sx: { color: 'rgba(255,255,255,0.5)' } },
    popupIndicator: { sx: { color: 'rgba(255,255,255,0.5)' } },
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

export default function RouteBuilder({ onChangeFloor, onNavigateToStart }: RouteBuilderProps) {
    const dispatch = useAppDispatch();

    const { buildings } = useAppSelector((state) => state.building);
    const { navigableRooms } = useAppSelector((state) => state.room);
    const { calculatedPath, pathSteps, routeLoading, fromOption, toOption } = useAppSelector((state) => state.map);

    const [customError, setCustomError] = useState<string | null>(null);

    const [buildingEntrances, setBuildingEntrances] = useState<Record<number, { nodeId: string; roomId?: string | null }>>({});
    const [isCheckingEntrances, setIsCheckingEntrances] = useState<boolean>(false);

    useEffect(() => {
        dispatch(fetchNavigableRooms());
    }, [dispatch]);

    useEffect(() => {
        let isMounted = true;

        const checkEntrances = async () => {
            setIsCheckingEntrances(true);
            const entrancesMap: Record<number, { nodeId: string; roomId?: string | null }> = {};

            await Promise.all(
                buildings.map(async (b) => {
                    try {
                        const res = await dispatch(fetchEntranceNode(b.id)).unwrap();
                        if (!res) return;

                        const resAny = res as any;
                        const node: Node | null = resAny.node ?? (resAny.id ? (resAny as Node) : null);

                        if (node?.id) {
                            const matchingRoom = navigableRooms.find((r) => r.node?.id === node.id);
                            const roomId = resAny.roomId ?? matchingRoom?.id ?? null;

                            entrancesMap[b.id] = {
                                nodeId: node.id,
                                roomId,
                            };
                        }
                    } catch {

                    }
                })
            );

            if (isMounted) {
                setBuildingEntrances(entrancesMap);
                setIsCheckingEntrances(false);
            }
        };

        if (buildings.length > 0) {
            checkEntrances();
        }
    }, [buildings, dispatch, navigableRooms]);

    const routeOptions = useMemo<RouteOption[]>(() => {
        const buildingOptions: RouteOption[] = buildings
            .filter((b) => Boolean(buildingEntrances[b.id]))
            .map((b) => ({
                kind: 'building',
                id: `building-${b.id}`,
                label: `${b.name}`,
                buildingId: b.id,
                nodeId: buildingEntrances[b.id]?.nodeId,
                roomId: buildingEntrances[b.id]?.roomId,
            }));

        const roomOptions: RouteOption[] = navigableRooms.map((r) => ({
            kind: 'room',
            id: r.id,
            label: `${r.name}`,
            buildingId: r.buildingId!,
            roomId: r.id,
            nodeId: r.node?.id ?? null,
            floor: r.floor,
        }));

        return [...buildingOptions, ...roomOptions];
    }, [buildings, buildingEntrances, navigableRooms]);

    const handleBuildRoute = async () => {
        if (!fromOption || !toOption) return;
        setCustomError(null);

        const fromId = fromOption.kind === 'building'
            ? String(fromOption.buildingId)
            : (fromOption.roomId || fromOption.nodeId || fromOption.id);
        const fromType = fromOption.kind;

        const toId = toOption.kind === 'building'
            ? String(toOption.buildingId)
            : (toOption.roomId || toOption.nodeId || toOption.id);
        const toType = toOption.kind;

        if (!fromId || !toId) {
            setCustomError("Не удалось определить точку старта или финиша.");
            return;
        }

        try {
            const res = await dispatch(calculateRoute({ fromId, fromType, toId, toType })).unwrap();
            const nodesList = res.nodes || [];
            const firstValidNode = nodesList.find((n: any) => n.floor !== null && n.floor !== undefined);

            let targetBuildingId: number | null = null;
            let targetFloor: number | null = null;

            if (fromOption.kind === 'room') {
                targetBuildingId = fromOption.buildingId ?? null;
                targetFloor = fromOption.floor ?? firstValidNode?.floor ?? 1;
            } else if (fromOption.kind === 'building' && toOption.kind === 'room') {
                targetBuildingId = fromOption.buildingId ?? null;
                targetFloor = firstValidNode?.floor ?? 1;
            } else {
                targetBuildingId = null;
                targetFloor = null;
            }

            if (onNavigateToStart) {
                onNavigateToStart(targetBuildingId, targetFloor);
            } else if (targetFloor !== null && onChangeFloor) {
                onChangeFloor(targetFloor);
            }
        } catch (err: any) {
            setCustomError(typeof err === 'string' ? err : "Не удалось найти путь между выбранными точками.");
        }
    };

    const handleSwap = () => {
        dispatch(swapRouteOptions());
        setCustomError(null);
    };

    const stepLabel = (step: typeof pathSteps[number], index: number, arr: typeof pathSteps) => {
        if (step.type === "elevator") {
            return `На лифте: этаж ${step.fromFloor} → этаж ${step.toFloor}`;
        }
        if (step.type === "stairs") {
            const direction = step.toFloor > step.fromFloor ? "Подняться" : "Спуститься";
            return `${direction} по лестнице: этаж ${step.fromFloor} → этаж ${step.toFloor}`;
        }
        if (step.type === "transition" || step.type === "street" || step.type === "outdoor") {
            return "Переход по улице";
        }

        const prev = arr[index - 1];
        const next = arr[index + 1];
        const isOutdoor = (t: string) => t === "transition" || t === "street" || t === "outdoor";

        if (next && isOutdoor(next.type)) {
            return `${step.fromFloor} этаж → Выход`;
        }

        if (prev && isOutdoor(prev.type)) {
            return `Вход в здание (${step.fromFloor} этаж)`;
        }

        return `Пройти по этажу ${step.fromFloor}`;
    };

    const stepIcon = (step: typeof pathSteps[number], index: number, arr: typeof pathSteps) => {
        if (step.type === "elevator") return <ElevatorOutlined sx={{ fontSize: 16, color: "#9C27B0" }} />;
        if (step.type === "stairs") return <StairsOutlined sx={{ fontSize: 16, color: "#4CAF50" }} />;

        const prev = arr[index - 1];
        const next = arr[index + 1];
        const isOutdoor = (t: string) => t === "transition" || t === "street" || t === "outdoor";

        if (next && isOutdoor(next.type)) {
            return <LogoutIcon sx={{ fontSize: 16, color: "#F44336" }} />;
        }
        if (prev && isOutdoor(prev.type)) {
            return <Login sx={{ fontSize: 16, color: "#00B074" }} />;
        }

        return <DirectionsWalk sx={{ fontSize: 16, color: "#2F80ED" }} />;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ color: "#90949C", fontWeight: 500 }} variant="subtitle2">
                Построить маршрут:
            </Typography>

            <Autocomplete
                options={routeOptions}
                loading={isCheckingEntrances}
                getOptionLabel={(o) => o.label}
                value={fromOption}
                onChange={(_, value) => {
                    dispatch(setFromOption(value));
                    setCustomError(null);
                }}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                slotProps={autocompleteSlotProps}
                renderInput={(params) => <TextField {...params} label="Откуда" size="small" sx={routeInputStyle} />}
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
                options={routeOptions}
                loading={isCheckingEntrances}
                getOptionLabel={(o) => o.label}
                value={toOption}
                onChange={(_, value) => {
                    dispatch(setToOption(value));
                    setCustomError(null);
                }}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                slotProps={autocompleteSlotProps}
                renderInput={(params) => <TextField {...params} label="Куда" size="small" sx={routeInputStyle} />}
            />

            <Button
                fullWidth
                variant="contained"
                disabled={!fromOption || !toOption || routeLoading}
                onClick={handleBuildRoute}
                sx={{
                    bgcolor: '#2F80ED',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#1B6FD1' },
                    '&.Mui-disabled': { bgcolor: 'rgba(47,128,237,0.15)', color: 'rgba(255,255,255,0.4)' }
                }}
            >
                {routeLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : "Построить маршрут"}
            </Button>

            {customError && (
                <Alert severity="warning" sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#FFB74D', fontSize: '12px', py: 0.5, whiteSpace: 'pre-line' }}>
                    {customError}
                </Alert>
            )}

            {calculatedPath.length > 0 && (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(47,128,237,0.08)', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#E4E6EB' }}>
                            Маршрут
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => dispatch(clearCalculatedPath())}
                            sx={{
                                backgroundColor: "#F44336",
                                minWidth: 'auto',
                                p: 0.5,
                                height: "25px",
                                width: "80px",
                                '&:hover': { backgroundColor: "#D32F2F" }
                            }}
                        >
                            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: '#E4E6EB' }}>
                                Сбросить
                            </Typography>
                        </Button>
                    </Box>

                    {(() => {
                        const isOutdoor = (t: string) => t === "transition" || t === "street" || t === "outdoor";
                        const isWalkingStep = (s: typeof pathSteps[number]) =>
                            s.type !== "elevator" && s.type !== "stairs" && !isOutdoor(s.type);

                        const uniqueFloors = new Set(
                            pathSteps.flatMap(s => [s.fromFloor, s.toFloor].filter(f => f !== undefined && f !== null))
                        );
                        const hasVertical = pathSteps.some(item => item.type === "elevator" || item.type === "stairs");
                        const hasOutdoor = pathSteps.some(item => isOutdoor(item.type));

                        if (uniqueFloors.size === 1 && !hasVertical && !hasOutdoor && pathSteps.length > 0) {
                            const floorNum = Array.from(uniqueFloors)[0] ?? 1;
                            return (
                                <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, cursor: 'pointer' }}
                                    onClick={() => onChangeFloor?.(floorNum)}
                                >
                                    <DirectionsWalk sx={{ fontSize: 16, color: "#2F80ED" }} />
                                    <Typography sx={{ fontSize: '12px', color: '#C4C7CC' }}>
                                        Переход проходит в пределах одного этажа
                                    </Typography>
                                </Box>
                            );
                        }

                        return pathSteps
                            .reduce((acc, step) => {
                                const last = acc[acc.length - 1];

                                if (last && isWalkingStep(last) && isWalkingStep(step) && last.fromFloor === step.fromFloor) {
                                    return acc;
                                }
                                if (last && isOutdoor(last.type) && isOutdoor(step.type)) {
                                    return acc;
                                }

                                acc.push(step);
                                return acc;
                            }, [] as typeof pathSteps)
                            .map((step, i, arr) => (
                                <Box
                                    key={`${step.fromNodeId}-${step.toNodeId}-${i}`}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, cursor: 'pointer' }}
                                    onClick={() => onChangeFloor?.(step.toFloor)}
                                >
                                    {stepIcon(step, i, arr)}
                                    <Typography sx={{ fontSize: '12px', color: '#C4C7CC' }}>
                                        {stepLabel(step, i, arr)}
                                    </Typography>
                                </Box>
                            ));
                    })()}
                </Box>
            )}
        </Box>
    );
}