import type {PathStep} from "../PathStep";

export interface PathResponse {
    nodes: { id: string; floor: number; x: number; y: number; buildingId?: number | null }[];
    steps: PathStep[];
    totalDistance: number;
}