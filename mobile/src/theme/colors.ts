export const colors = {
  bg: {
    primary: '#0A0A0A',
    secondary: '#141414',
    surface: '#1C1C1C',
    glass: 'rgba(255,255,255,0.05)',
    glassStrong: 'rgba(255,255,255,0.10)',
  },
  accent: {
    blue: '#00D4FF',
    glow: 'rgba(0,212,255,0.15)',
    gold: '#C9A84C',
    goldDim: 'rgba(201,168,76,0.20)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#555555',
    inverse: '#0A0A0A',
  },
  border: {
    default: 'rgba(255,255,255,0.10)',
    active: 'rgba(0,212,255,0.40)',
    subtle: 'rgba(255,255,255,0.05)',
  },
  status: {
    success: '#00E676',
    successDim: 'rgba(0,230,118,0.15)',
    warning: '#FFB300',
    warningDim: 'rgba(255,179,0,0.15)',
    error: '#FF1744',
    errorDim: 'rgba(255,23,68,0.15)',
    info: '#00D4FF',
  },
  booking: {
    pending: '#FFB300',
    confirmed: '#00D4FF',
    in_progress: '#7C4DFF',
    completed: '#00E676',
    cancelled: '#FF1744',
  },
} as const;

export type Colors = typeof colors;
