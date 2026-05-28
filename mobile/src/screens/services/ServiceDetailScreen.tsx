import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { Service } from '../../types';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { formatPrice } from '../../utils/formatters';
import { useBookingStore } from '../../store/bookingStore';
import StarRating from '../../components/ui/StarRating';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'ServiceDetail'>;
type Route = RouteProp<CustomerStackParamList, 'ServiceDetail'>;

export default function ServiceDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { serviceId } = route.params;
  const setService = useBookingStore((s) => s.setService);
  const [service, setServiceData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Service>(`services/${serviceId}`)
      .then(({ data }) => setServiceData(data))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleBook = () => {
    if (!service) return;
    setService(service);
    navigation.navigate('BookingStep1', { serviceId: service.id });
  };

  if (loading || !service) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent.blue} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.heroWrap}>
          <View style={styles.heroIcon}>
            <Ionicons name="car-sport" size={64} color={colors.accent.blue} />
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{service.name}</Text>
            {service.rating_avg ? (
              <View style={styles.ratingRow}>
                <StarRating rating={service.rating_avg} size={16} />
                <Text style={styles.ratingText}>({service.review_count})</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.muted} />
              <Text style={styles.metaText}>{service.duration_minutes} min</Text>
            </View>
            {service.category && (
              <View style={styles.metaItem}>
                <Ionicons name="grid-outline" size={16} color={colors.text.muted} />
                <Text style={styles.metaText}>{service.category.name}</Text>
              </View>
            )}
          </View>

          <Text style={styles.price}>{formatPrice(service.price)}</Text>

          {service.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{service.description}</Text>
            </View>
          ) : null}

          {(service.benefits as string[] | null)?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              {(service.benefits as string[]).map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.accent.blue} />
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {service.addons?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Add-ons</Text>
              {service.addons.map((a) => (
                <View key={a.id} style={styles.addonRow}>
                  <Text style={styles.addonName}>{a.name}</Text>
                  <Text style={styles.addonPrice}>+{formatPrice(a.price)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Starting from</Text>
          <Text style={styles.footerPrice}>{formatPrice(service.price)}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { paddingBottom: 120 },
  heroWrap: {
    height: 220,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.bg.primary}CC`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, gap: 16 },
  titleRow: { gap: 8 },
  name: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 13, color: colors.text.muted },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: colors.text.secondary },
  price: { fontSize: typography.sizes.h2, fontWeight: '800', color: colors.accent.blue },
  section: { gap: 12 },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  description: { fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { fontSize: 14, color: colors.text.secondary },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  addonName: { fontSize: 14, color: colors.text.primary },
  addonPrice: { fontSize: 14, fontWeight: '600', color: colors.accent.blue },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: { fontSize: 12, color: colors.text.muted },
  footerPrice: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  bookBtn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  bookBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
