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
