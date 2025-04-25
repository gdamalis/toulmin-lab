export interface ToulminArgument {
  claim: string;
  grounds: string;
  groundsBacking: string;
  warrant: string;
  warrantBacking: string;
  qualifier: string;
  rebuttal: string;
}

export interface ToulminDiagramNode {
  id: string;
  type: string;
  data: {
    label: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface ToulminDiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

export interface ToulminDiagramData {
  nodes: ToulminDiagramNode[];
  edges: ToulminDiagramEdge[];
} 