import type { Building } from "@shared/types/Building";
import http from "../http.ts";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface BuildingState {
    buildings: Building[];
    selectedBuildingId: number | null;
    selectedFloor: number | null;
    hoveredBuildingId: number | null;
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
        const response = await http.get<Building[]>('/api/buildings');
        return response.data;
    }
);

export const createBuilding = createAsyncThunk<Building,any>(
    'building/create',
    async (buildingData) => {
        const response = await http.post<Building>('/api/buildings', buildingData);
        return response.data;
    }
);

export const deleteBuilding = createAsyncThunk<number, number>(
    'building/delete',
    async (id) => {
        await http.delete(`/api/buildings/${id}`);
        return id;
    }
);

export const updateBuilding = createAsyncThunk<Building, any>(
    'building/update',
    async (buildingData) => {
        const response = await http.put<Building>(`/api/buildings/${buildingData.id}`, buildingData);
        return response.data;
    }
);

const buildingSlice = createSlice({
    name: 'building',
    initialState,
    reducers: {
        setSelectedBuildingId: (state, action: PayloadAction<number | null>) => {
            state.selectedBuildingId = action.payload;
        },
        setSelectedFloor: (state, action: PayloadAction<number | null>) => {
            state.selectedFloor = action.payload;
        },
        setHoveredBuildingId: (state, action: PayloadAction<number | null>) => {
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
            })

            .addCase(createBuilding.fulfilled,(state, action) => {
               state.buildings.push(action.payload);
            })
            .addCase(deleteBuilding.fulfilled, (state, action) => {
                state.buildings = state.buildings.filter(b => b.id !== action.payload);
                if (state.selectedBuildingId === action.payload) {
                    state.selectedBuildingId = null;
                }
            })
            .addCase(updateBuilding.fulfilled, (state, action) => {
                const index = state.buildings.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.buildings[index] = action.payload;
                }
            });
    },
});

export const { setSelectedBuildingId, setSelectedFloor, setHoveredBuildingId } = buildingSlice.actions;
export default buildingSlice.reducer;