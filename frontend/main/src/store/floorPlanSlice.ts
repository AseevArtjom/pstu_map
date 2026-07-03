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

export const uploadFloorPlan = createAsyncThunk<
    FloorPlanDto,
    { buildingId: number; floorNumber: number; file: File }
>(
    'floor/upload',
    async ({ buildingId, floorNumber, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await http.post<FloorPlanDto>(
            `/api/buildings/${buildingId}/floors/${floorNumber}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    }
);

export const deleteFloorPlan = createAsyncThunk<number, { buildingId: number; floorId: number }>(
    'floor/delete',
    async ({ buildingId, floorId }) => {
        await http.delete(`/api/buildings/${buildingId}/floors/${floorId}`);
        return floorId;
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

            .addCase(uploadFloorPlan.pending, (state) => {
                state.uploading = true;
            })
            .addCase(uploadFloorPlan.fulfilled, (state, action) => {
                state.uploading = false;
                const index = state.floors.findIndex(f => f.floorNumber === action.payload.floorNumber);
                if (index !== -1) {
                    state.floors[index] = action.payload;
                } else {
                    state.floors.push(action.payload);
                }
            })
            .addCase(uploadFloorPlan.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.error.message || 'Ошибка при загрузке файла';
            })

            .addCase(deleteFloorPlan.fulfilled, (state, action) => {
                state.floors = state.floors.filter(f => f.id !== action.payload);
            });
    },
});

export const { clearFloors } = floorPlanSlice.actions;
export default floorPlanSlice.reducer;