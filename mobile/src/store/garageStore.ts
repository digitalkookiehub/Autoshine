import { create } from 'zustand';
import { api } from '../services/api';
import type { UserVehicle } from '../types';

interface CreateVehiclePayload {
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate: string;
}

interface GarageState {
  vehicles: UserVehicle[];
  selectedVehicle: UserVehicle | null;
  selectVehicle: (vehicle: UserVehicle | null) => void;
  loadVehicles: () => Promise<void>;
  addVehicle: (payload: CreateVehiclePayload) => Promise<void>;
  updateVehicle: (id: number, payload: Partial<CreateVehiclePayload>) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;
}

export const useGarageStore = create<GarageState>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,

  selectVehicle: (selectedVehicle) => set({ selectedVehicle }),

  loadVehicles: async () => {
    try {
      const { data } = await api.get<UserVehicle[]>('garage');
      set({ vehicles: data });
    } catch {}
  },

  addVehicle: async (payload) => {
    const { data } = await api.post<UserVehicle>('garage', payload);
    set((s) => ({ vehicles: [...s.vehicles, data] }));
  },

  updateVehicle: async (id, payload) => {
    const { data } = await api.put<UserVehicle>(`garage/${id}`, payload);
    set((s) => ({
      vehicles: s.vehicles.map((v) => (v.id === id ? data : v)),
      selectedVehicle: s.selectedVehicle?.id === id ? data : s.selectedVehicle,
    }));
  },

  deleteVehicle: async (id) => {
    await api.delete(`garage/${id}`);
    set((s) => ({
      vehicles: s.vehicles.filter((v) => v.id !== id),
      selectedVehicle: s.selectedVehicle?.id === id ? null : s.selectedVehicle,
    }));
  },
}));
