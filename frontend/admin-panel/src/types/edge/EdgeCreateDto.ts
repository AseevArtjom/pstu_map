export interface EdgeCreateDto {
    fromNodeId: string;
    toNodeId: string;
    weight: number;
    type: string;
}