import { create } from 'zustand';
import { api } from '../services/api';

interface StudioSettings {
  name: string;
  tagline: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
}

interface StudioStore extends StudioSettings {
  load: () => Promise<void>;
  update: (data: Partial<StudioSettings>) => void;
}

export const useStudioStore = create<StudioStore>((set) => ({
  name: 'Autoshine Studio',
  tagline: null,
  logo_url: null,
  phone: null,
  address: null,
  email: null,

  load: async () => {
    try {
      const { data } = await api.get<StudioSettings>('studio');
      set(data);
    } catch {}
  },

  update: (data) => set((prev) => ({ ...prev, ...data })),
}));
