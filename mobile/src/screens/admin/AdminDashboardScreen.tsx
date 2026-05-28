import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { AdminStackParamList } from '../../app/navigation/AdminNavigator';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface DashboardStats {
  today_bookings: number;
  today_revenue: number;
  pending_bookings: number;
  total_customers: number;
  this_month_revenue: number;
  this_month_bookings: number;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<DashboardStats>('admin/dashboard');
      setStats(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const statCards = stats ? [
    { label: "Today's Bookings", value: String(stats.today_bookings), icon: 'calendar', color: colors.accent.blue },
    { label: "Today's Revenue", value: formatPrice(stats.today_revenue), icon: 'cash', color: colors.status.success },
    { label: 'Pending', value: String(stats.pending_bookings), icon: 'time', color: colors.status.warning },
    { label: 'Customers', value: String(stats.total_customers), icon: 'people', color: colors.accent.gold },
    { label: 'Month Revenue', value: formatPrice(stats.this_month_revenue), icon: 'trending-up', color: colors.accent.blue },
    { label: 'Month Bookings', value: String(stats.this_month_bookings), icon: 'bar-chart', color: colors.text.secondary },
  ] : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.slotsBtn} onPress={() => navigation.navigate('AdminSlots')}>
          <Ionicons name="calendar" size={18} color={colors.bg.primary} />
          <Text style={styles.slotsBtnText}>Slots</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.grid}>
        {statCards.map((card) => (
          <View key={card.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${card.color}20` }]}>
              <Ionicons name={card.icon as any} size={22} color={card.color} />
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => (navigation as any).navigate('BookingsTab')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.accent.blue} />
          <Text style={styles.actionLabel}>Today's Bookings</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => (navigation as any).navigate('CustomersTab')}
          activeOpacity={0.8}
        >
          <Ionicons name="people-outline" size={24} color={colors.accent.gold} />
          <Text style={styles.actionLabel}>Manage Customers</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  date: { fontSize: 13, color: colors.text.muted, marginTop: 4 },
  slotsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accent.blue, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  slotsBtnText: { color: colors.bg.primary, fontWeight: '700' },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.bg.secondary,
    borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: colors.border.default,
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.muted },
  quickActions: { gap: 12 },
  actionCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: colors.border.default,
  },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text.primary },
});
