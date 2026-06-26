import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import type {Building} from "../types/Building.ts";
import http from "../http.ts";

interface BuildingState {
    buildings: Building[];
    selectedBuildingId: string | null;
    selectedFloor: number | null;
    hoveredBuildingId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: BuildingState = {
    buildings: [],
    selectedBuildingId: null,
    selectedFloor: 1,
    hoveredBuildingId: null,
    loading: false,
    error: null,
};

export const fetchAllBuildings = createAsyncThunk<Building[]>(
    'building/fetchAll',
    async () => {
        const response = await http.get<Building[]>('/buildings');
        return response.data;
    }
);

const buildingSlice = createSlice({
    name: 'building',
    initialState,
    reducers: {
        setSelectedBuildingId: (state, action: PayloadAction<string | null>) => {
            state.selectedBuildingId = action.payload;
            if (action.payload === null) {
                state.selectedFloor = null;
            } else if (state.selectedFloor === null) {
                state.selectedFloor = 1;
            }
        },
        setSelectedFloor: (state, action: PayloadAction<number | null>) => {
            state.selectedFloor = action.payload;
        },
        setHoveredBuildingId: (state, action: PayloadAction<string | null>) => {
            state.hoveredBuildingId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllBuildings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllBuildings.fulfilled, (state, action) => {
                state.loading = false;
                state.buildings = action.payload;
            })
            .addCase(fetchAllBuildings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Ошибка загрузки зданий';
            });
    },
});

export const { setSelectedBuildingId, setSelectedFloor, setHoveredBuildingId } = buildingSlice.actions;
export default buildingSlice.reducer;