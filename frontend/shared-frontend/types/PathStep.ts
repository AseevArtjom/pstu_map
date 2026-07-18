export interface PathStep {
    fromNodeId: string;
    toNodeId: string;
    fromFloor: number;
    toFloor: number;
    type: string;
    weight: number;
}