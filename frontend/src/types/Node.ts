import type {Building} from "./Building.ts";

export interface Node {
    id: string;
    floor: number;
    x: number;
    y: number;
    building?: Building;
}