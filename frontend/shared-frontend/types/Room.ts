import type {Node} from "./Node.ts";
import type {RoomType} from "./RoomType";

export interface Room {
    id: string;
    name: string;
    floor: number;
    roomType: RoomType;
    description: string;
    node: Node | null;
    buildingId?: number;
    qrCode?: string;
    roomPolygon?: string;
    customColor?: string;
    customIconPath?: string;
}