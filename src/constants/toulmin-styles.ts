export const NODE_BASE_STYLE = {
  padding: "10px",
  borderRadius: "5px",
  width: 250,
};

export const NODE_STYLES = {
  claim: { ...NODE_BASE_STYLE, background: "#2563eb" },
  grounds: { ...NODE_BASE_STYLE, background: "#0891b2" },
  warrant: { ...NODE_BASE_STYLE, background: "#15803d" },
  qualifier: { ...NODE_BASE_STYLE, background: "#a16207" },
  groundsBacking: { ...NODE_BASE_STYLE, background: "#7c3aed" },
  warrantBacking: { ...NODE_BASE_STYLE, background: "#7c3aed" },
  rebuttal: { ...NODE_BASE_STYLE, background: "#b91c1c" },
  midpointClaim: { width: 0, height: 0, background: "#fff" },
  midpointQualifier: { width: 0, height: 0, background: "#fff" },
};

export const EXPORT_CONFIG = {
  backgroundColor: "white",
  canvasWidth: 1000,
  canvasHeight: 1000,
};
