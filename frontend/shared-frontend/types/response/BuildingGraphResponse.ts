export interface BuildingGraphResponse {
    nodes: { id: string; floor: number; x: number; y: number; buildingId?: number | null }[];
    edges: { id: number; from: string; to: string; weight: number; type: string }[];
}