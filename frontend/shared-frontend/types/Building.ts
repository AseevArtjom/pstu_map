import type {FloorPlanDto} from "./FloorPlanDto";

export interface Building {
    id: number;
    name: string;
    lengthM: number;
    depthM: number;
    mapPolygon?: string;
    icon_path: string | null;
    hex_color: string;
    floors?: FloorPlanDto[];
}