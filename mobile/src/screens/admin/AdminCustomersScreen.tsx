import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { User } from '../../types';
import { AdminStackParamList } from '../../app/navigation/AdminNavigator';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminCustomersScreen() {
  const navigation = useNavigation<Nav>();
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (q?: string) => {
    try {
      const { data } = await api.get<User[]>('admin/customers', {
        params: q ? { search: q } : {},
      });
      setCustomers(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            placeholderTextColor={colors.text.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search); }} tintColor={colors.accent.blue} />
        }
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdminCustomerDetail', { customerId: c.id })}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{c.full_name?.charAt(0) ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.full_name}</Text>
              <Text style={styles.phone}>{c.phone_number}</Text>
              <View style={styles.meta}>
                <View style={styles.tierBadge}>
                  <Ionicons name="diamond" size={10} color={colors.accent.gold} />
                  <Text style={styles.tierText}>{c.membership_tier}</Text>
                </View>
                <Text style={styles.points}>{c.loyalty_points} pts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, gap: 14 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bg.secondary, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: colors.border.default,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: colors.border.default,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.accent.glow, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.accent.blue },
  name: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  phone: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tierText: { fontSize: 11, color: colors.accent.gold, fontWeight: '600', textTransform: 'capitalize' },
  points: { fontSize: 11, color: colors.text.muted },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.text.muted },
});
