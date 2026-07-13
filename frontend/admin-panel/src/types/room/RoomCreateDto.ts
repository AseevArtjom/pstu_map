export interface RoomCreateDto {
    id: string;
    name: string;
    floor: number;
    roomTypeId: number;
    description?: string | null;
    buildingId: number;
    nodeId: string | null;
    qrCode: string | null;
    roomPolygon: string;
    customColor?: string;
    customIconId?: number;
}