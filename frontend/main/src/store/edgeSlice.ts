import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Edge } from "@shared/types/Edge.ts";
import type { EdgeResponseDto } from "@shared/types/response/EdgeResponseDto.ts";
import http from "../http.ts";
import type { RootState } from "./store.ts";

interface EdgeState {
    edges: Edge[];
    loading: boolean;
}

const initialState: EdgeState = {
    edges: [],
    loading: false,
};

const resolveEdges = (dtos: EdgeResponseDto[], nodes: { id: string }[]): Edge[] => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    return dtos.reduce<Edge[]>((acc, dto) => {
        const fromNode = nodeMap.get(dto.from);
        const toNode = nodeMap.get(dto.to);

        if (!fromNode || !toNode) {
            console.warn(`Ребро ${dto.id} ссылается на неизвестный узел (${dto.from} -> ${dto.to}), пропущено`);
            return acc;
        }

        acc.push({
            id: dto.id,
            fromNode: fromNode as any,
            toNode: toNode as any,
            weight: dto.weight,
            type: dto.type,
        });
        return acc;
    }, []);
};

export const fetchEdgesByBuilding = createAsyncThunk<Edge[], number, { state: RootState }>(
    'edge/fetchByBuilding',
    async (buildingId, { getState }) => {
        const response = await http.get<EdgeResponseDto[]>(`/api/edges?buildingId=${buildingId}`);
        const { nodes } = getState().node;
        return resolveEdges(response.data, nodes);
    }
);

export const fetchOutdoorEdges = createAsyncThunk<Edge[], void, { state: RootState }>(
    'edge/fetchOutdoor',
    async (_, { getState }) => {
        const response = await http.get<EdgeResponseDto[]>('/api/edges/outdoor');
        const { nodes } = getState().node;
        return resolveEdges(response.data, nodes);
    }
);

const edgeSlice = createSlice({
    name: 'edge',
    initialState,
    reducers: {
        clearEdges: (state) => {
            state.edges = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEdgesByBuilding.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEdgesByBuilding.fulfilled, (state, action) => {
                state.loading = false;
                state.edges = action.payload;
            })
            .addCase(fetchEdgesByBuilding.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchOutdoorEdges.fulfilled, (state, action) => {
                const existingIds = new Set(state.edges.map(e => e.id));
                const newEdges = action.payload.filter(e => !existingIds.has(e.id));
                state.edges.push(...newEdges);
            })
    },
});

export const { clearEdges } = edgeSlice.actions;
export default edgeSlice.reducer;