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
import { Service, ServiceCategory } from '../../types';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { formatPrice } from '../../utils/formatters';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export default function ServicesScreen() {
  const navigation = useNavigation<Nav>();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get<Service[]>('services', { params: { category_id: selectedCat ?? undefined } }),
        api.get<ServiceCategory[]>('categories'),
      ]);
      setServices(sRes.data);
      setCategories(cRes.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [selectedCat]);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={colors.text.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={[{ id: null, name: 'All' } as any, ...categories]}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cats}
        style={styles.catsList}
        keyExtractor={(i) => String(i.id ?? 'all')}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, selectedCat === item.id && styles.catChipActive]}
            onPress={() => setSelectedCat(item.id)}
          >
            <Text style={[styles.catLabel, selectedCat === item.id && styles.catLabelActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} width="100%" height={120} borderRadius={16} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="car-sport" size={24} color={colors.accent.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCat} numberOfLines={1}>{item.category?.name}</Text>
                  <Text style={styles.cardDuration}>{item.duration_minutes} min</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                {item.rating_avg ? (
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color={colors.accent.gold} />
                    <Text style={styles.ratingText}>{item.rating_avg.toFixed(1)}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.text.muted} />
              <Text style={styles.emptyText}>No services found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, gap: 16 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 15 },
  catsList: { flexGrow: 0 },
  cats: { paddingHorizontal: 20, paddingBottom: 16, gap: 8, alignItems: 'center' },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  catChipActive: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  catLabel: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  catLabelActive: { color: colors.bg.primary },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  cardCat: { fontSize: 12, color: colors.text.muted },
  cardDuration: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: 16, fontWeight: '700', color: colors.accent.blue },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, color: colors.accent.gold },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: colors.text.muted },
});
