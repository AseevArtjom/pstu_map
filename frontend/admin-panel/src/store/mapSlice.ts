import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Node } from "@shared/types/Node.ts";
import type { Edge } from "@shared/types/Edge.ts";
import type { BuildingGraphResponse } from "@shared/types/response/BuildingGraphResponse.ts";
import type { PathResponse } from "@shared/types/response/PathResponse.ts";
import http from "../http.ts";
import type { PathStep } from "@shared/types/PathStep.ts";

export interface RouteOption {
    kind: 'building' | 'room';
    id: string;
    label: string;
    buildingId: number;
    roomId?: string | null;
    nodeId?: string | null;
    floor?: number;
}

interface MapState {
    nodes: Node[];
    edges: Edge[];
    calculatedPath: Node[];
    pathSteps: PathStep[];
    totalDistance: number;
    graphLoading: boolean;
    routeLoading: boolean;
    error: string | null;
    fromOption: RouteOption | null;
    toOption: RouteOption | null;
}

const initialState: MapState = {
    nodes: [],
    edges: [],
    calculatedPath: [],
    pathSteps: [],
    totalDistance: 0,
    graphLoading: false,
    routeLoading: false,
    error: null,
    fromOption: null,
    toOption: null,
};

export const fetchBuildingGraph = createAsyncThunk<BuildingGraphResponse, number>(
    'map/fetchGraph',
    async (buildingId) => {
        const response = await http.get<BuildingGraphResponse>(`/api/map/${buildingId}`);
        return response.data;
    }
);

export const calculateRoute = createAsyncThunk(
    'map/calculateRoute',
    async (params: { fromId: string; fromType: string; toId: string; toType: string }) => {
        const response = await http.get<PathResponse>('/api/map/path', { params });
        return response.data;
    }
);

const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        clearCalculatedPath: (state) => {
            state.calculatedPath = [];
            state.pathSteps = [];
            state.totalDistance = 0;
            state.error = null;
        },
        setFromOption: (state, action: PayloadAction<RouteOption | null>) => {
            state.fromOption = action.payload;
        },
        setToOption: (state, action: PayloadAction<RouteOption | null>) => {
            state.toOption = action.payload;
        },
        swapRouteOptions: (state) => {
            const temp = state.fromOption;
            state.fromOption = state.toOption;
            state.toOption = temp;
        },
        clearRoute: (state) => {
            state.calculatedPath = [];
            state.pathSteps = [];
            state.totalDistance = 0;
            state.fromOption = null;
            state.toOption = null;
            state.error = null;
        },
        setCalculatedPath: (state, action: PayloadAction<Node[]>) => {
            state.calculatedPath = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBuildingGraph.pending, (state) => {
                state.graphLoading = true;
            })
            .addCase(fetchBuildingGraph.fulfilled, (state, action) => {
                state.graphLoading = false;
                state.nodes = action.payload.nodes;

                const nodeMap = new Map(action.payload.nodes.map(n => [n.id, n]));

                const validEdges: Edge[] = [];
                for (const e of action.payload.edges) {
                    const fromNode = nodeMap.get(e.from);
                    const toNode = nodeMap.get(e.to);
                    if (fromNode && toNode) {
                        validEdges.push({
                            id: e.id,
                            fromNode,
                            toNode,
                            weight: e.weight,
                            type: e.type,
                        } as Edge);
                    }
                }
                state.edges = validEdges;
            })
            .addCase(fetchBuildingGraph.rejected, (state, action) => {
                state.graphLoading = false;
                state.error = action.error.message || 'Ошибка загрузки графа';
            })
            .addCase(calculateRoute.pending, (state) => {
                state.routeLoading = true;
                state.error = null;
            })
            .addCase(calculateRoute.fulfilled, (state, action) => {
                state.routeLoading = false;
                state.calculatedPath = action.payload.nodes as Node[];
                state.pathSteps = action.payload.steps;
                state.totalDistance = action.payload.totalDistance;
            })
            .addCase(calculateRoute.rejected, (state, action) => {
                state.routeLoading = false;
                state.error = action.error.message || 'Не удалось построить маршрут';
                state.calculatedPath = [];
                state.pathSteps = [];
            });
    },
});

export const {
    clearCalculatedPath,
    setFromOption,
    setToOption,
    swapRouteOptions,
    clearRoute,
    setCalculatedPath
} = mapSlice.actions;

export default mapSlice.reducer;