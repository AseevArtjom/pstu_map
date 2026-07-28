export type CrossLocationTarget =
    | { kind: 'floor'; buildingId: number; floor: number }
    | { kind: 'outdoor' }
    | { kind: 'building'; buildingId: number };