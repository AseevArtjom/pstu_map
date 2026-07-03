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

export const uploadIcon = createAsyncThunk('icons/upload', async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/api/icons`, {
        method: 'POST',
        body: formData,
    });
    return (await response.json()) as UploadedIcon;
});

export const deleteIcon = createAsyncThunk('icons/delete', async (id: number) => {
    await fetch(`${BASE_URL}/api/icons/${id}`, { method: 'DELETE' });
    return id;
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
            .addCase(uploadIcon.fulfilled, (state, action) => {
                state.icons.push(action.payload);
            })
            .addCase(deleteIcon.fulfilled, (state, action) => {
                state.icons = state.icons.filter(icon => icon.id !== action.payload);
            });
    },
});
export default iconSlice.reducer;