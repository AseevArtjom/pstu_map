import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Node } from "@shared/types/Node.ts";
import type { Edge } from "@shared/types/Edge.ts";
import type { BuildingGraphResponse } from "@shared/types/response/BuildingGraphResponse.ts";
import type { PathResponse, PathStep } from "@shared/types/response/PathResponse.ts";
import http from "../http.ts";

interface MapState {
    nodes: Node[];
    edges: Edge[];
    calculatedPath: Node[];
    pathSteps: PathStep[];
    totalDistance: number;
    graphLoading: boolean;
    routeLoading: boolean;
    error: string | null;
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
};

export const fetchBuildingGraph = createAsyncThunk<BuildingGraphResponse, number>(
    'map/fetchGraph',
    async (buildingId) => {
        const response = await http.get<BuildingGraphResponse>(`/api/map/${buildingId}`);
        return response.data;
    }
);

export const calculateRoute = createAsyncThunk<PathResponse, { fromRoomId: string; toRoomId: string }>(
    'map/calculateRoute',
    async ({ fromRoomId, toRoomId }) => {
        const response = await http.get<PathResponse>('/api/map/path', {
            params: { fromRoomId, toRoomId },
        });
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
                state.edges = action.payload.edges
                    .map(e => {
                        const fromNode = nodeMap.get(e.from);
                        const toNode = nodeMap.get(e.to);
                        if (!fromNode || !toNode) return null;
                        return { id: e.id, fromNode, toNode, weight: e.weight, type: e.type };
                    })
                    .filter((e): e is Edge => e !== null);
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

export const { clearCalculatedPath } = mapSlice.actions;
export default mapSlice.reducer;