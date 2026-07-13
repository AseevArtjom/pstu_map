import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RoomType } from "@shared/types/RoomType.ts";
import http from "../http.ts";
import type {RoomTypeCreateDto} from "../types/roomType/RoomTypeCreateDto.ts";
import type {RoomTypeUpdateDto} from "../types/roomType/RoomTypeUpdateDto.ts";

interface RoomTypeState {
    roomTypes: RoomType[];
    loading: boolean;
}

const initialState: RoomTypeState = {
    roomTypes: [],
    loading: false,
};

export const fetchRoomTypes = createAsyncThunk<RoomType[]>(
    'roomType/fetchAll',
    async () => {
        const response = await http.get<RoomType[]>('/api/room-types');
        return response.data;
    }
);

export const createRoomType = createAsyncThunk('roomType/create', async (dto: RoomTypeCreateDto) => {
    const response = await http.post<RoomType>('/api/room-types', dto);
    return response.data;
});

export const updateRoomType = createAsyncThunk('roomType/update', async ({ id, data }: { id: number, data: RoomTypeUpdateDto }) => {
    const response = await http.put<RoomType>(`/api/room-types/${id}`, data);
    return response.data;
});

export const deleteRoomType = createAsyncThunk('roomType/delete', async (id: number) => {
    await http.delete(`/api/room-types/${id}`);
    return id;
});

const roomTypeSlice = createSlice({
    name: 'roomType',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomTypes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRoomTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.roomTypes = action.payload;
            })
            .addCase(fetchRoomTypes.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createRoomType.fulfilled, (state, action) => {
                state.roomTypes.push(action.payload);
            })
            .addCase(updateRoomType.fulfilled, (state, action) => {
                const index = state.roomTypes.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.roomTypes[index] = action.payload;
            })
            .addCase(deleteRoomType.fulfilled, (state, action) => {
                state.roomTypes = state.roomTypes.filter(t => t.id !== action.payload);
            });
    },
});

export default roomTypeSlice.reducer;