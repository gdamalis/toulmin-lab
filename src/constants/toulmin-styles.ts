export const NODE_BASE_STYLE = {
  padding: '10px',
  borderRadius: '5px',
  width: 180,
};

export const NODE_STYLES = {
  claim: { ...NODE_BASE_STYLE, background: '#e3f2fd' },
  grounds: { ...NODE_BASE_STYLE, background: '#e8f5e9' },
  warrant: { ...NODE_BASE_STYLE, background: '#fff3e0' },
  qualifier: { ...NODE_BASE_STYLE, background: '#e0f7fa' },
  groundsBacking: { ...NODE_BASE_STYLE, background: '#f1f8e9' },
  warrantBacking: { ...NODE_BASE_STYLE, background: '#fff8e1' },
  rebuttal: { ...NODE_BASE_STYLE, background: '#ffebee' },
};

export const EXPORT_CONFIG = {
  backgroundColor: 'white',
  canvasWidth: 800,
  canvasHeight: 600,
}; 