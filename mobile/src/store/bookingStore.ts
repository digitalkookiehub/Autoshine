import { create } from 'zustand';
import type { Service, UserVehicle, TimeSlot, ServiceAddon } from '../types';

interface BookingDraft {
  service: Service | null;
  vehicle: UserVehicle | null;
  slot: TimeSlot | null;
  selectedAddons: ServiceAddon[];
  promoCode: string;
  pickupRequired: boolean;
  pickupAddress: string;
  notes: string;
}

interface BookingState {
  draft: BookingDraft;
  currentStep: number;
  setService: (service: Service) => void;
  setVehicle: (vehicle: UserVehicle | null) => void;
  setSlot: (slot: TimeSlot) => void;
  toggleAddon: (addon: ServiceAddon) => void;
  setPromoCode: (code: string | undefined) => void;
  setPickupRequired: (value: boolean) => void;
  setPickupAddress: (address: string) => void;
  setNotes: (notes: string) => void;
  setStep: (step: number) => void;
  resetDraft: () => void;
  getTotalPrice: () => number;
}

const initialDraft: BookingDraft = {
  service: null,
  vehicle: null,
  slot: null,
  selectedAddons: [],
  promoCode: '',
  pickupRequired: false,
  pickupAddress: '',
  notes: '',
};

export const useBookingStore = create<BookingState>((set, get) => ({
  draft: initialDraft,
  currentStep: 1,
  setService: (service) => set((s) => ({ draft: { ...s.draft, service } })),
  setVehicle: (vehicle) => set((s) => ({ draft: { ...s.draft, vehicle } })),
  setSlot: (slot) => set((s) => ({ draft: { ...s.draft, slot } })),
  toggleAddon: (addon) =>
    set((s) => {
      const exists = s.draft.selectedAddons.find((a) => a.id === addon.id);
      return {
        draft: {
          ...s.draft,
          selectedAddons: exists
            ? s.draft.selectedAddons.filter((a) => a.id !== addon.id)
            : [...s.draft.selectedAddons, addon],
        },
      };
    }),
  setPromoCode: (code) => set((s) => ({ draft: { ...s.draft, promoCode: code ?? '' } })),
  setPickupRequired: (pickupRequired) => set((s) => ({ draft: { ...s.draft, pickupRequired } })),
  setPickupAddress: (pickupAddress) => set((s) => ({ draft: { ...s.draft, pickupAddress } })),
  setNotes: (notes) => set((s) => ({ draft: { ...s.draft, notes } })),
  setStep: (currentStep) => set({ currentStep }),
  resetDraft: () => set({ draft: initialDraft, currentStep: 1 }),
  getTotalPrice: () => {
    const { service, selectedAddons } = get().draft;
    const base = service ? parseFloat(service.price) : 0;
    const addons = selectedAddons.reduce((sum, a) => sum + parseFloat(a.price), 0);
    return base + addons;
  },
}));
