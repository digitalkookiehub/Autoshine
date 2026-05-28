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
import { formatPrice, formatDate, formatTime } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { AdminStackParamList } from '../../app/navigation/AdminNavigator';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Route = RouteProp<AdminStackParamList, 'AdminBookingDetail'>;

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirm',
  in_progress: 'Start',
  completed: 'Complete',
  cancelled: 'Cancel',
};

export default function AdminBookingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    api.get<Booking>(`admin/bookings`).then(({ data }) => {
      // Filter the booking we need from the list since there's no single booking endpoint in admin
      const found = (data as any as Booking[]).find?.((b: Booking) => b.id === bookingId);
      if (found) setBooking(found);
      else api.get<Booking[]>('admin/bookings').then(({ data: list }) => {
        setBooking((list as Booking[]).find((b) => b.id === bookingId) ?? null);
      });
    });
  };

  useEffect(() => { load(); }, [bookingId]);

  const updateStatus = async (status: string) => {
    const label = STATUS_LABELS[status] ?? status;
    Alert.alert(
      `${label} Booking`,
      `Are you sure you want to ${label.toLowerCase()} this booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: label,
          style: status === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdating(true);
            try {
              await api.put(`admin/bookings/${bookingId}/status`, { status });
              load();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.detail ?? 'Update failed.');
            } finally {
              setUpdating(false);
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

  const transitions = STATUS_TRANSITIONS[booking.status] ?? [];

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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.row}><Text style={styles.label}>Service</Text><Text style={styles.value}>{booking.service?.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{booking.slot ? formatDate(booking.slot.date) : '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Time</Text><Text style={styles.value}>{booking.slot ? formatTime(booking.slot.start_time) : '—'}</Text></View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(booking.total_price)}</Text>
          </View>
        </View>

        {booking.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Notes</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        ) : null}

        {transitions.length > 0 && (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Update Status</Text>
            {transitions.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.actionBtn,
                  s === 'cancelled' && styles.cancelBtn,
                  updating && { opacity: 0.6 },
                ]}
                onPress={() => updateStatus(s)}
                disabled={updating}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionBtnText, s === 'cancelled' && styles.cancelBtnText]}>
                  {STATUS_LABELS[s] ?? s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  statusRow: { alignItems: 'flex-start' },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardTitle: { fontSize: 12, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: colors.text.muted },
  value: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.accent.blue },
  notesText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  actionsSection: { gap: 10 },
  actionsTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  actionBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.status.error },
  actionBtnText: { color: colors.bg.primary, fontWeight: '700', fontSize: 15 },
  cancelBtnText: { color: colors.status.error },
});
