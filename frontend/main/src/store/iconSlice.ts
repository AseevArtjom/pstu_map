import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from "../http";
import type { UploadedIcon } from "@shared/types/UploadedIcon.ts"

interface IconState {
    icons: UploadedIcon[];
    loading: boolean;
}

const initialState: IconState = {
    icons: [],
    loading: false,
};

export const fetchIcons = createAsyncThunk('icons/fetchAll', async () => {
    const response = await fetch(`${BASE_URL}/api/icons`);
    return (await response.json()) as UploadedIcon[];
});


const iconSlice = createSlice({
    name: 'icon',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchIcons.fulfilled, (state, action) => {
                state.icons = Array.isArray(action.payload) ? action.payload : [];
            })
    },
});
export default iconSlice.reducer;