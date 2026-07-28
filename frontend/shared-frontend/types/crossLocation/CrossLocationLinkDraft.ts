export interface CrossLocationLinkDraft {
    fromNodeId: string;
    fromBuildingId: number | null;
    fromFloor: number;
    edgeType: 'stairs' | 'elevator' | 'transition' | 'outdoor';
}