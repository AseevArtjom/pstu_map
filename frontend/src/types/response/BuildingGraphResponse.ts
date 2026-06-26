import type {Node} from "../Node.ts";
import type {Edge} from "../Edge.ts";

export interface BuildingGraphResponse {
    nodes: Node[];
    edges: Edge[];
}