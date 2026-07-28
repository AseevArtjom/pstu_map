import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Node } from "@shared/types/Node.ts";
import type { NodeCreateDto } from "../types/node/NodeCreateDto.ts";
import type { NodeUpdateDto } from "../types/node/NodeUpdateDto.ts";
import http from "../http.ts";
import type { NodeResponseDto } from "@shared/types/response/NodeResponseDto.ts";

interface NodeState {
    nodes: Node[];
    loading: boolean;
}

const initialState: NodeState = {
    nodes: [],
    loading: false,
};

const toNode = (dto: NodeResponseDto): Node => ({
    id: dto.id,
    floor: dto.floor,
    x: dto.x,
    y: dto.y,
    building: dto.buildingId ? ({ id: dto.buildingId } as any) : undefined,
});

export const fetchNodesByBuilding = createAsyncThunk<Node[], number>(
    'node/fetchByBuilding',
    async (buildingId) => {
        const response = await http.get<NodeResponseDto[]>(`/api/nodes?buildingId=${buildingId}`);
        return response.data.map(toNode);
    }
);

export const fetchOutdoorNodes = createAsyncThunk<Node[]>(
    'node/fetchOutdoor',
    async () => {
        const response = await http.get<NodeResponseDto[]>('/api/nodes/outdoor');
        return response.data.map(toNode);
    }
);

export const fetchAllNodesGlobal = createAsyncThunk<Node[]>(
    'node/fetchAllGlobal',
    async () => {
        const response = await http.get<NodeResponseDto[]>('/api/nodes');
        return response.data.map(toNode);
    }
);

export const createNode = createAsyncThunk<Node, NodeCreateDto>(
    'node/create',
    async (dto) => {
        const response = await http.post<NodeResponseDto>('/api/nodes', dto);
        return toNode(response.data);
    }
);

export const updateNode = createAsyncThunk<Node, { id: string; data: NodeUpdateDto }>(
    'node/update',
    async ({ id, data }) => {
        const response = await http.put<NodeResponseDto>(`/api/nodes/${id}`, data);
        return toNode(response.data);
    }
);

export const deleteNode = createAsyncThunk<string, string>(
    'node/delete',
    async (id) => {
        await http.delete(`/api/nodes/${id}`);
        return id;
    }
);

const nodeSlice = createSlice({
    name: 'node',
    initialState,
    reducers: {
        clearNodes: (state) => {
            state.nodes = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNodesByBuilding.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNodesByBuilding.fulfilled, (state, action) => {
                state.loading = false;
                const currentBuildingId = action.meta.arg;

                const otherNodes = state.nodes.filter(n => n.building?.id !== currentBuildingId);
                state.nodes = [...otherNodes, ...action.payload];
            })
            .addCase(fetchNodesByBuilding.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchOutdoorNodes.fulfilled, (state, action) => {
                const existingIds = new Set(state.nodes.map(n => n.id));
                const newNodes = action.payload.filter(n => !existingIds.has(n.id));
                state.nodes.push(...newNodes);
            })
            .addCase(fetchAllNodesGlobal.fulfilled, (state, action) => {
                state.nodes = action.payload;
            })
            .addCase(createNode.fulfilled, (state, action) => {
                state.nodes.push(action.payload);
            })
            .addCase(updateNode.fulfilled, (state, action: PayloadAction<Node>) => {
                const index = state.nodes.findIndex(n => n.id === action.payload.id);
                if (index !== -1) state.nodes[index] = action.payload;
            })
            .addCase(deleteNode.fulfilled, (state, action) => {
                state.nodes = state.nodes.filter(n => n.id !== action.payload);
            });
    },
});

export const { clearNodes } = nodeSlice.actions;
export default nodeSlice.reducer;