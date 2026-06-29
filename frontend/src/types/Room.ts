import type {Node} from "./Node.ts";

export interface Room {
    id: string;
    name: string;
    floor: number;
    type: string;
    description: string;
    node: Node;
    qrCode?: string;
    roomPolygon?: string;
}