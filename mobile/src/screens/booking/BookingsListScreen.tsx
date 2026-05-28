import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { formatPrice, formatDate, formatTime } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

const FILTERS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function BookingsListScreen() {
  const navigation = useNavigation<Nav>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get<Booking[]>('bookings', { params });
      setBookings(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterList}
        keyExtractor={(f) => f}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={{ padding: 20, gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} width="100%" height={100} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />
          }
          renderItem={({ item: b }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <Text style={styles.serviceName}>{b.service?.name}</Text>
                <StatusBadge status={b.status} />
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
                  <Text style={styles.metaText}>{b.slot ? formatDate(b.slot.date) : '—'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.text.muted} />
                  <Text style={styles.metaText}>{b.slot ? formatTime(b.slot.start_time) : '—'}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.price}>{formatPrice(b.total_price)}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={56} color={colors.text.muted} />
              <Text style={styles.emptyText}>No bookings found</Text>
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => navigation.navigate('ServicesTab' as any)}
              >
                <Text style={styles.bookNowText}>Book a Service</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  filterList: { flexGrow: 0 },
  filters: { paddingHorizontal: 20, paddingBottom: 12, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default,
  },
  filterChipActive: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  filterLabel: { fontSize: 13, fontWeight: '500', color: colors.text.secondary, textTransform: 'capitalize' },
  filterLabelActive: { color: colors.bg.primary },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 15, fontWeight: '600', color: colors.text.primary, flex: 1, marginRight: 8 },
  cardMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: colors.text.muted },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '700', color: colors.accent.blue },
  empty: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 16, color: colors.text.muted },
  bookNowBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  bookNowText: { color: colors.bg.primary, fontWeight: '700', fontSize: 15 },
});
