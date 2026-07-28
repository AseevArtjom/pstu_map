import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RoomType } from "@shared/types/RoomType.ts";
import http from "../http.ts";

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
    },
});

export default roomTypeSlice.reducer;