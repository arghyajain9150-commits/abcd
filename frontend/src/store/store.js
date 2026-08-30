import { create } from 'zustand';

const getStoredToken = () => {
  const t = localStorage.getItem('champ_token');
  return (t && t !== 'undefined' && t !== 'null' && t !== '') ? t : null;
};

export const useAuthStore = create((set) => ({
  user: null,
  token: getStoredToken(),

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('champ_token', token);
    } else {
      localStorage.removeItem('champ_token');
    }
    set({ user, token: token || null });
  },

  logout: () => {
    localStorage.removeItem('champ_token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export const useUIStore = create((set) => ({
  emergencyOpen: false,
  setEmergencyOpen: (v) => set({ emergencyOpen: v }),
}));

export const DEFAULT_OUTBREAK_CONFIG = {
  active: true,
  diseaseKey: 'conjunctivitis',
  diseaseName: 'Viral Conjunctivitis (Eye Flu)',
  category: 'Contact & Droplet Transmission',
  r0: 1.84,
  incubationDays: 2,
  infectiousDays: 6,
  isolationDays: 5,
  activeCases: 7,
  severity: 'high', // 'low' | 'moderate' | 'high' | 'critical' | 'resolved'
  affectedBlocks: ['Hostel Block B', 'Hostel Block C'],
  clinicalAdvisory: 'Mandatory isolation for infected students. Frequent eye washes with sterile saline, avoid touching eyes, and wear protective tinted glasses.',
  lastUpdated: 'Just now',
  updatedBy: 'Dr. Aris Thorne (Chief Medical Officer)',
};

const getStoredOutbreak = () => {
  try {
    const saved = localStorage.getItem('champ_outbreak_config');
    return saved ? JSON.parse(saved) : DEFAULT_OUTBREAK_CONFIG;
  } catch {
    return DEFAULT_OUTBREAK_CONFIG;
  }
};

export const useOutbreakStore = create((set) => ({
  config: getStoredOutbreak(),
  updateConfig: (newConfig) => {
    set((state) => {
      const merged = { ...state.config, ...newConfig, lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
      localStorage.setItem('champ_outbreak_config', JSON.stringify(merged));
      return { config: merged };
    });
  },
  resetConfig: () => {
    localStorage.setItem('champ_outbreak_config', JSON.stringify(DEFAULT_OUTBREAK_CONFIG));
    set({ config: DEFAULT_OUTBREAK_CONFIG });
  },
}));
