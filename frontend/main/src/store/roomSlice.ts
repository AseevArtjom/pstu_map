import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import type {Room} from "@shared/types/Room.ts";
import http from "../http.ts";


interface RoomState {
    rooms: Room[];
    startRoom: Room | null;
    endRoom: Room | null;
    loading: boolean;
}

const initialState: RoomState = {
    rooms: [],
    startRoom: null,
    endRoom: null,
    loading: false,
};

export const fetchRoomsByBuilding = createAsyncThunk<Room[], string>(
    'room/fetchByBuilding',
    async (buildingId) => {
        const response = await http.get<Room[]>(`/rooms?buildingId=${buildingId}`);
        return response.data;
    }
);

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        setStartRoom: (state, action: PayloadAction<Room | null>) => {
            state.startRoom = action.payload;
        },
        setEndRoom: (state, action: PayloadAction<Room | null>) => {
            state.endRoom = action.payload;
        },
        clearSelectedRooms: (state) => {
            state.startRoom = null;
            state.endRoom = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoomsByBuilding.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRoomsByBuilding.fulfilled, (state, action) => {
                state.loading = false;
                state.rooms = action.payload;
            })
            .addCase(fetchRoomsByBuilding.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setStartRoom, setEndRoom, clearSelectedRooms } = roomSlice.actions;
export default roomSlice.reducer;