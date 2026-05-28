import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { formatPrice, formatDate, formatTime, formatRelativeTime } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'BookingDetail'>;

export default function BookingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    api.get<Booking>(`bookings/${bookingId}`).then(({ data }) => setBooking(data));
  };

  useEffect(() => { load(); }, [bookingId]);

  const cancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.post(`bookings/${bookingId}/cancel`, { reason: 'Customer requested cancellation' });
              load();
            } catch (e: any) {
              Alert.alert('Cannot Cancel', e?.response?.data?.detail ?? 'Cancellation failed.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (!booking) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent.blue} />
      </View>
    );
  }

  const canReview = booking.status === 'completed';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking #{booking.id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusRow}>
          <StatusBadge status={booking.status} size="lg" />
          <Text style={styles.time}>{formatRelativeTime(booking.created_at)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Details</Text>
          <View style={styles.row}><Text style={styles.label}>Service</Text><Text style={styles.value}>{booking.service?.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{booking.slot ? formatDate(booking.slot.date) : '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Time</Text><Text style={styles.value}>{booking.slot ? formatTime(booking.slot.start_time) : '—'}</Text></View>
          {booking.vehicle && (
            <View style={styles.row}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>{booking.vehicle.make} {booking.vehicle.model}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pricing</Text>
          <View style={styles.row}><Text style={styles.label}>Base price</Text><Text style={styles.value}>{formatPrice(booking.service?.price ?? 0)}</Text></View>
          {(booking.addon_ids?.length ?? 0) > 0 && (
            <View style={styles.row}><Text style={styles.label}>Add-ons</Text><Text style={styles.value}>{booking.addon_ids?.length} selected</Text></View>
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(booking.total_price)}</Text>
          </View>
        </View>

        {booking.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        ) : null}

        {canReview && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('Review', { bookingId: booking.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="star-outline" size={18} color={colors.accent.gold} />
            <Text style={styles.reviewBtnText}>Leave a Review</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
            onPress={cancel}
            disabled={cancelling}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 13, color: colors.text.muted },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: colors.text.muted },
  value: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.accent.blue },
  notesText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.accent.gold, borderRadius: 14, paddingVertical: 14,
  },
  reviewBtnText: { color: colors.accent.gold, fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    borderWidth: 1.5, borderColor: colors.status.error, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { color: colors.status.error, fontWeight: '700', fontSize: 15 },
});
