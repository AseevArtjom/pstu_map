import { configureStore } from "@reduxjs/toolkit";
import buildingReducer from './buildingSlice';
import roomReducer from './roomSlice';
import mapReducer from './mapSlice';
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import floorPlanReducer from "./floorPlanSlice.ts";
import iconReducer from "./iconSlice.ts";
import roomTypeReducer from "./roomTypeSlice.ts";
import nodeReducer from "./nodeSlice.ts";
import edgeReducer from "./edgeSlice.ts";

export const store = configureStore({
    reducer: {
        building: buildingReducer,
        room: roomReducer,
        map: mapReducer,
        floorPlan: floorPlanReducer,
        icon: iconReducer,
        roomType: roomTypeReducer,
        node: nodeReducer,
        edge: edgeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;