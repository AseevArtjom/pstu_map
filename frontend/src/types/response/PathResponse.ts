import type {Node} from "../Node.ts";

export interface PathResponse {
    path: Node[];
    totalDistance: number;
}