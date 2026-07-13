export interface NodeCreateDto {
    id?: string;
    floor: number;
    x: number;
    y: number;
    buildingId?: number | null;
}