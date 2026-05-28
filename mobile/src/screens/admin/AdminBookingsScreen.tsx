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
import { formatPrice, formatDate, formatTime } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { AdminStackParamList } from '../../app/navigation/AdminNavigator';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const FILTERS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AdminBookingsScreen() {
  const navigation = useNavigation<Nav>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get<Booking[]>('admin/bookings', { params });
      setBookings(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
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
            onPress={() => navigation.navigate('AdminBookingDetail', { bookingId: b.id })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <Text style={styles.bookingId}>#{b.id}</Text>
              <StatusBadge status={b.status} />
            </View>
            <Text style={styles.serviceName}>{b.service?.name}</Text>
            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={colors.text.muted} />
                <Text style={styles.metaText}>{b.slot ? formatDate(b.slot.date) : '—'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={colors.text.muted} />
                <Text style={styles.metaText}>{b.slot ? formatTime(b.slot.start_time) : '—'}</Text>
              </View>
              <Text style={styles.price}>{formatPrice(b.total_price)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>No {filter === 'all' ? '' : filter} bookings</Text>
          </View>
        }
      />
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
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { fontSize: 13, fontWeight: '700', color: colors.text.muted },
  serviceName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.text.muted },
  price: { marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: colors.accent.blue },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.text.muted, textTransform: 'capitalize' },
});
