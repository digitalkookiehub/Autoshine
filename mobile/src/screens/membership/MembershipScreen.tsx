import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { MembershipPlan, UserMembership } from '../../types';
import { formatPrice } from '../../utils/formatters';

export default function MembershipScreen() {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [current, setCurrent] = useState<UserMembership | null>(null);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  const load = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        api.get<MembershipPlan[]>('memberships/plans'),
        api.get<UserMembership>('memberships/my').catch(() => ({ data: null })),
      ]);
      setPlans(pRes.data);
      setCurrent((mRes as any).data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const subscribe = async (planId: number) => {
    setSubscribing(planId);
    try {
      await api.post('memberships/subscribe', { plan_id: planId });
      await load();
      Alert.alert('Subscribed!', 'Your membership has been activated.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Subscription failed.');
    } finally {
      setSubscribing(null);
    }
  };

  const tierColors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: colors.accent.gold,
    platinum: '#E5E4E2',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Membership</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {current && (
          <View style={styles.currentCard}>
            <Ionicons name="diamond" size={28} color={tierColors[current.plan?.tier ?? 'bronze']} />
            <View>
              <Text style={styles.currentLabel}>Current Plan</Text>
              <Text style={styles.currentPlan}>{current.plan?.name}</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Choose a Plan</Text>

        {plans.map((plan) => {
          const isActive = current?.plan_id === plan.id;
          const tierColor = tierColors[plan.tier] ?? colors.accent.blue;
          return (
            <View key={plan.id} style={[styles.planCard, isActive && styles.planCardActive]}>
              <View style={styles.planHeader}>
                <View style={[styles.tierBadge, { backgroundColor: `${tierColor}20` }]}>
                  <Ionicons name="diamond" size={16} color={tierColor} />
                  <Text style={[styles.tierLabel, { color: tierColor }]}>{plan.tier.toUpperCase()}</Text>
                </View>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
              </View>

              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                {formatPrice(plan.price)}
                <Text style={styles.planPeriod}>/month</Text>
              </Text>

              {(plan.benefits as string[] | null)?.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={16} color={tierColor} />
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}

              {!isActive && (
                <TouchableOpacity
                  style={[styles.subBtn, { backgroundColor: tierColor }]}
                  onPress={() => subscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  activeOpacity={0.8}
                >
                  <Text style={styles.subBtnText}>
                    {subscribing === plan.id ? 'Processing...' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 16 },
  currentCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: colors.accent.gold,
  },
  currentLabel: { fontSize: 12, color: colors.text.muted },
  currentPlan: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  planCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 20, padding: 20, gap: 12,
    borderWidth: 1.5, borderColor: colors.border.default,
  },
  planCardActive: { borderColor: colors.accent.gold },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tierLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  activeBadge: { backgroundColor: `${colors.accent.gold}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  activeBadgeText: { color: colors.accent.gold, fontSize: 12, fontWeight: '600' },
  planName: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  planPrice: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
  planPeriod: { fontSize: 15, fontWeight: '400', color: colors.text.muted },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { fontSize: 14, color: colors.text.secondary },
  subBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  subBtnText: { color: '#0A0A0A', fontWeight: '700', fontSize: 15 },
});
