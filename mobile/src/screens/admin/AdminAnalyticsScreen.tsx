import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatters';

interface AnalyticsData {
  total_bookings: number;
  total_revenue: number;
  completed: number;
  cancelled: number;
  range: string;
}

const RANGES = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

export default function AdminAnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data: d } = await api.get<AnalyticsData>('admin/analytics', { params: { range } });
      setData(d);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [range]);

  const completionRate = data && data.total_bookings > 0
    ? Math.round((data.completed / data.total_bookings) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />}
    >
      <Text style={styles.title}>Analytics</Text>

      {/* Range selector */}
      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[styles.rangeBtn, range === r.value && styles.rangeBtnActive]}
            onPress={() => setRange(r.value)}
          >
            <Text style={[styles.rangeLabel, range === r.value && styles.rangeLabelActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Revenue</Text>
        <Text style={styles.bigValue}>{data ? formatPrice(data.total_revenue) : '—'}</Text>
        <Text style={styles.cardSub}>Total for the period</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Ionicons name="calendar" size={24} color={colors.accent.blue} />
          <Text style={styles.statValue}>{data?.total_bookings ?? '—'}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
          <Text style={styles.statValue}>{data?.completed ?? '—'}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Ionicons name="close-circle" size={24} color={colors.status.error} />
          <Text style={styles.statValue}>{data?.cancelled ?? '—'}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Ionicons name="trending-up" size={24} color={colors.accent.gold} />
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
      </View>

      {/* Progress bar */}
      {data && data.total_bookings > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Breakdown</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { flex: data.completed, backgroundColor: colors.status.success }]} />
            <View style={[styles.progressBar, { flex: data.cancelled, backgroundColor: colors.status.error }]} />
            <View style={[styles.progressBar, { flex: data.total_bookings - data.completed - data.cancelled, backgroundColor: colors.accent.blue }]} />
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.success }]} />
              <Text style={styles.legendLabel}>Completed ({data.completed})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.error }]} />
              <Text style={styles.legendLabel}>Cancelled ({data.cancelled})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent.blue }]} />
              <Text style={styles.legendLabel}>Other ({data.total_bookings - data.completed - data.cancelled})</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, gap: 16 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default,
  },
  rangeBtnActive: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  rangeLabel: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  rangeLabelActive: { color: colors.bg.primary },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 20, gap: 8,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  bigValue: { fontSize: 36, fontWeight: '800', color: colors.text.primary },
  cardSub: { fontSize: 13, color: colors.text.muted },
  row: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.muted },
  progressRow: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' },
  progressBar: { height: '100%' },
  legendRow: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13, color: colors.text.secondary },
});
