import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Room } from "@shared/types/Room.ts";
import http from "../http.ts";
import type {RoomUpdateDto} from "../types/room/RoomUpdateDto.ts";
import type {RoomCreateDto} from "../types/room/RoomCreateDto.ts";
import {deleteNode} from "./nodeSlice.ts";

interface RoomState {
    rooms: Room[];
    navigableRooms: Room[];
    startRoom: Room | null;
    endRoom: Room | null;
    loading: boolean;
}

const initialState: RoomState = {
    rooms: [],
    navigableRooms: [],
    startRoom: null,
    endRoom: null,
    loading: false,
};

export const fetchRoomsByBuilding = createAsyncThunk<Room[], number>(
    'room/fetchByBuilding',
    async (buildingId) => {
        const response = await http.get<Room[]>(`/api/rooms?buildingId=${buildingId}`);
        return response.data;
    }
);

export const fetchNavigableRooms = createAsyncThunk<Room[]>(
    'room/fetchNavigable',
    async () => {
        const response = await http.get<Room[]>('/api/rooms/navigable');
        return response.data;
    }
);

export const createRoom = createAsyncThunk('room/create', async (roomData: RoomCreateDto) => {
    const response = await http.post<Room>('/api/rooms', roomData);
    return response.data;
});

export const updateRoom = createAsyncThunk('room/update', async ({ id, data }: { id: string, data: RoomUpdateDto }) => {
    const response = await http.put<Room>(`/api/rooms/${id}`, data);
    return response.data;
});

export const deleteRoom = createAsyncThunk('room/delete', async (id: string) => {
    await http.delete(`/api/rooms/${id}`);
    return id;
});

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
            })
            .addCase(fetchNavigableRooms.fulfilled, (state, action) => {
                state.navigableRooms = action.payload;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.rooms.push(action.payload);
            })
            .addCase(updateRoom.fulfilled, (state, action) => {
                const index = state.rooms.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.rooms[index] = action.payload;
            })
            .addCase(deleteRoom.fulfilled, (state, action) => {
                state.rooms = state.rooms.filter(r => r.id !== action.payload);
            })
            .addCase(deleteNode.fulfilled, (state, action) => {
                const deletedNodeId = action.payload;
                state.rooms.forEach((room) => {
                    if (room.node?.id === deletedNodeId) {
                        room.node = null;
                    }
                });
            });
    },
});

export const { setStartRoom, setEndRoom, clearSelectedRooms } = roomSlice.actions;
export default roomSlice.reducer;