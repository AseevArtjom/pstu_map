import type {Node} from "./Node.ts";

export interface Edge {
  id?: number;
  fromNode: Node;
  toNode: Node;
  weight: number;
  type: string;
}