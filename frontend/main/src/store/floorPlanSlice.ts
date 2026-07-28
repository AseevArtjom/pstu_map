import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import http from "../http.ts";

export interface FloorPlanDto {
    id: number;
    floorNumber: number;
    imagePath: string;
}

interface FloorPlanState {
    floors: FloorPlanDto[];
    loading: boolean;
    uploading: boolean;
    error: string | null;
}

const initialState: FloorPlanState = {
    floors: [],
    loading: false,
    uploading: false,
    error: null,
};

export const fetchFloorsByBuilding = createAsyncThunk<FloorPlanDto[], number>(
    'floor/fetchByBuilding',
    async (buildingId) => {
        const response = await http.get<FloorPlanDto[]>(`/api/buildings/${buildingId}/floors`);
        return response.data;
    }
);

const floorPlanSlice = createSlice({
    name: 'floorPlan',
    initialState,
    reducers: {
        clearFloors: (state) => {
            state.floors = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFloorsByBuilding.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFloorsByBuilding.fulfilled, (state, action) => {
                state.loading = false;
                state.floors = action.payload;
            })
            .addCase(fetchFloorsByBuilding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Не удалось загрузить этажи';
            })
    },
});

export const { clearFloors } = floorPlanSlice.actions;
export default floorPlanSlice.reducer;