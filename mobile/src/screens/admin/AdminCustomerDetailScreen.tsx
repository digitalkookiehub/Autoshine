import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { Booking, User } from '../../types';
import { formatPrice, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { AdminStackParamList } from '../../app/navigation/AdminNavigator';

type Route = RouteProp<AdminStackParamList, 'AdminCustomerDetail'>;

interface CustomerDetail {
  user: User;
  booking_count: number;
  total_spent: number;
}

export default function AdminCustomerDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { customerId } = route.params;
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<CustomerDetail>(`admin/customers/${customerId}`),
      api.get<Booking[]>(`admin/customers/${customerId}/bookings`),
    ]).then(([dRes, bRes]) => {
      setDetail(dRes.data);
      setBookings(bRes.data);
    });
  }, [customerId]);

  if (!detail) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent.blue} />
      </View>
    );
  }

  const { user } = detail;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.full_name?.charAt(0) ?? '?'}</Text>
          </View>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.phone}>{user.phone_number}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{detail.booking_count}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatPrice(detail.total_spent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.loyalty_points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Booking History</Text>
        {bookings.map((b) => (
          <View key={b.id} style={styles.bookingCard}>
            <View style={styles.bookingTop}>
              <Text style={styles.serviceName}>{b.service?.name}</Text>
              <StatusBadge status={b.status} />
            </View>
            <View style={styles.bookingMeta}>
              <Text style={styles.metaText}>{b.slot ? formatDate(b.slot.date) : '—'}</Text>
              <Text style={styles.bookingPrice}>{formatPrice(b.total_price)}</Text>
            </View>
          </View>
        ))}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 20 },
  profileSection: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.accent.glow, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.accent.blue,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.accent.blue },
  name: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  phone: { fontSize: 14, color: colors.text.muted },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.bg.secondary,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border.default,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.muted, marginTop: 4 },
  statDiv: { width: 1, backgroundColor: colors.border.default, marginHorizontal: 12 },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  bookingCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.border.default,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 14, fontWeight: '600', color: colors.text.primary, flex: 1, marginRight: 8 },
  bookingMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: colors.text.muted },
  bookingPrice: { fontSize: 13, fontWeight: '700', color: colors.accent.blue },
});
