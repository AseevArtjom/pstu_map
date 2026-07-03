import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Node } from "@shared/types/Node.ts";
import type { Edge } from "@shared/types/Edge.ts";
import type { BuildingGraphResponse } from "@shared/types/response/BuildingGraphResponse.ts";
import http from "../http.ts";
import type { PathResponse } from "@shared/types/response/PathResponse.ts";

interface MapState {
    nodes: Node[];
    edges: Edge[];
    calculatedPath: Node[];
    totalDistance: number;
    graphLoading: boolean;
    routeLoading: boolean;
    error: string | null;
}

const initialState: MapState = {
    nodes: [],
    edges: [],
    calculatedPath: [],
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
            params: { from: fromRoomId, to: toRoomId },
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
            state.totalDistance = 0;
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
                state.edges = action.payload.edges;
            })
            .addCase(fetchBuildingGraph.rejected, (state, action) => {
                state.graphLoading = false;
                state.error = action.error.message || 'Ошибка загрузки графа';
            })
            .addCase(calculateRoute.pending, (state) => {
                state.routeLoading = true;
            })
            .addCase(calculateRoute.fulfilled, (state, action) => {
                state.routeLoading = false;
                state.calculatedPath = action.payload.path;
                state.totalDistance = action.payload.totalDistance;
            })
            .addCase(calculateRoute.rejected, (state, action) => {
                state.routeLoading = false;
                state.error = action.error.message || 'Не удалось построить маршрут';
            });
    },
});

export const { clearCalculatedPath } = mapSlice.actions;
export default mapSlice.reducer;