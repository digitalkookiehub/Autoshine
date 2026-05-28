import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { useBookingStore } from '../../store/bookingStore';
import { useGarageStore } from '../../store/garageStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import ProgressStepper from '../../components/ui/ProgressStepper';
import { formatPrice, formatDate, formatTime } from '../../utils/formatters';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export default function BookingStep4Screen() {
  const navigation = useNavigation<Nav>();
  const { draft, getTotalPrice, resetDraft } = useBookingStore();
  const { selectedVehicle } = useGarageStore();
  const [loading, setLoading] = useState(false);

  const confirmBooking = async () => {
    if (!draft.service || !draft.slot || !selectedVehicle) return;
    setLoading(true);
    try {
      const { data } = await api.post('bookings', {
        service_id: draft.service.id,
        slot_id: draft.slot.id,
        vehicle_id: selectedVehicle.id,
        addon_ids: draft.selectedAddons.map((a) => a.id),
        promo_code: draft.promoCode || undefined,
        notes: draft.notes || undefined,
      });
      resetDraft();
      navigation.replace('BookingConfirm', { bookingId: data.id });
    } catch (e: any) {
      Alert.alert('Booking Failed', e?.response?.data?.detail ?? 'Could not confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotalPrice();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressStepper currentStep={4} totalSteps={4} labels={['Vehicle', 'Date', 'Add-ons', 'Confirm']} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Review & Confirm</Text>

        {/* Service */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Service</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{draft.service?.name}</Text>
            <Text style={styles.rowValue}>{formatPrice(draft.service?.price ?? 0)}</Text>
          </View>
        </View>

        {/* Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vehicle</Text>
          <Text style={styles.rowLabel}>
            {selectedVehicle?.make} {selectedVehicle?.model} · {selectedVehicle?.year}
          </Text>
          <Text style={styles.rowSub}>{selectedVehicle?.license_plate}</Text>
        </View>

        {/* Date & time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date & Time</Text>
          <Text style={styles.rowLabel}>
            {draft.slot ? formatDate(draft.slot.date) : ''} at {draft.slot ? formatTime(draft.slot.start_time) : ''}
          </Text>
        </View>

        {/* Add-ons */}
        {draft.selectedAddons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Add-ons</Text>
            {draft.selectedAddons.map((a) => (
              <View key={a.id} style={styles.row}>
                <Text style={styles.rowLabel}>{a.name}</Text>
                <Text style={styles.rowValue}>+{formatPrice(a.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {draft.promoCode ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Promo Code</Text>
            <Text style={styles.promoCode}>{draft.promoCode}</Text>
          </View>
        ) : null}

        {draft.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.rowLabel}>{draft.notes}</Text>
          </View>
        ) : null}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Estimated Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={confirmBooking}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.bg.primary} />
          <Text style={styles.confirmBtnText}>{loading ? 'Confirming...' : 'Confirm Booking'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 4 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  section: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.text.muted, letterSpacing: 0.5, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.text.primary },
  rowSub: { fontSize: 13, color: colors.text.muted },
  rowValue: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  promoCode: { fontSize: 15, color: colors.accent.blue, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    marginTop: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  totalValue: { fontSize: 24, fontWeight: '800', color: colors.accent.blue },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: colors.bg.primary },
  confirmBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
