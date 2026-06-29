export interface Building {
    id: string;
    name: string;
    lengthM: number;
    depthM: number;
    mapPolygon?: string;
    icon_path: string | null;
}