export interface RoomUpdateDto {
    name?: string;
    floor?: number;
    roomTypeId?: number;
    description?: string;
    buildingId?: number;
    nodeId?: string;
    qrCode?: string;
    roomPolygon?: string;
    customColor?: string;
    customIconId?: number;
}