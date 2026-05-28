import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { LoyaltyTransaction } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface LoyaltyData {
  total_points: number;
  transactions: LoyaltyTransaction[];
}

export default function LoyaltyScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    api.get<LoyaltyData>('loyalty').then(({ data: d }) => setData(d));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Loyalty Points</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.pointsCard}>
        <Ionicons name="star" size={40} color={colors.accent.gold} />
        <Text style={styles.pointsValue}>{data?.total_points ?? 0}</Text>
        <Text style={styles.pointsLabel}>Total Points</Text>
        <Text style={styles.pointsNote}>Earn 100 points per referral · 50 points per booking</Text>
      </View>

      <Text style={styles.sectionTitle}>History</Text>

      <FlatList
        data={data?.transactions ?? []}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: t }) => (
          <View style={styles.txRow}>
            <View style={[styles.txIcon, t.points > 0 ? styles.txIconPositive : styles.txIconNegative]}>
              <Ionicons
                name={t.points > 0 ? 'add' : 'remove'}
                size={18}
                color={t.points > 0 ? colors.status.success : colors.status.error}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txDesc}>{t.description}</Text>
              <Text style={styles.txTime}>{formatRelativeTime(t.created_at)}</Text>
            </View>
            <Text style={[styles.txPoints, t.points > 0 ? styles.txPositive : styles.txNegative]}>
              {t.points > 0 ? '+' : ''}{t.points}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  pointsCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 20, margin: 20, padding: 28,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.accent.gold,
  },
  pointsValue: { fontSize: 56, fontWeight: '800', color: colors.accent.gold },
  pointsLabel: { fontSize: 16, color: colors.text.secondary },
  pointsNote: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.bg.secondary, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border.default,
  },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txIconPositive: { backgroundColor: `${colors.status.success}20` },
  txIconNegative: { backgroundColor: `${colors.status.error}20` },
  txDesc: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  txTime: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  txPoints: { fontSize: 16, fontWeight: '800' },
  txPositive: { color: colors.status.success },
  txNegative: { color: colors.status.error },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: colors.text.muted, fontSize: 14 },
});
