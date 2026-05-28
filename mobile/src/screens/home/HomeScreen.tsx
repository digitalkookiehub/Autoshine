import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Image, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Service, Booking, GalleryItem } from '../../types';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { formatPrice } from '../../utils/formatters';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useStudioStore } from '../../store/studioStore';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

interface HomeFeed {
  featured_services: Service[];
  gallery: GalleryItem[];
  upcoming_booking: Booking | null;
  loyalty_points: number;
  membership_tier: string;
}

interface Offer {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expires_at: string | null;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const studio = useStudioStore();
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [feedRes, offersRes] = await Promise.all([
        api.get<HomeFeed>('home'),
        api.get<Offer[]>('home/offers'),
      ]);
      setFeed(feedRes.data);
      setOffers(offersRes.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SkeletonLoader width="100%" height={80} borderRadius={16} />
        <SkeletonLoader width="100%" height={120} borderRadius={16} style={{ marginTop: 16 }} />
        <SkeletonLoader width="100%" height={200} borderRadius={16} style={{ marginTop: 16 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {studio.logo_url ? (
            <Image source={{ uri: studio.logo_url }} style={styles.studioLogo} />
          ) : null}
          <View>
            <Text style={styles.studioName}>{studio.name}</Text>
            <Text style={styles.greeting}>{greeting()}, {user?.full_name?.split(' ')[0] ?? 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={26} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Loyalty card */}
      <View style={styles.loyaltyCard}>
        <View>
          <Text style={styles.loyaltyLabel}>Loyalty Points</Text>
          <Text style={styles.loyaltyPoints}>{feed?.loyalty_points ?? 0}</Text>
        </View>
        <View style={styles.tierBadge}>
          <Ionicons name="diamond" size={14} color={colors.accent.gold} />
          <Text style={styles.tierText}>{feed?.membership_tier ?? 'bronze'}</Text>
        </View>
      </View>

      {/* Offers */}
      {offers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerIconWrap}>
                  <Ionicons name="pricetag" size={20} color={colors.accent.gold} />
                </View>
                <Text style={styles.offerCode}>{offer.code}</Text>
                <Text style={styles.offerDiscount}>
                  {offer.discount_type === 'percentage'
                    ? `${offer.discount_value}% OFF`
                    : `₹${offer.discount_value} OFF`}
                </Text>
                {offer.expires_at && (
                  <Text style={styles.offerExpiry}>
                    Expires {new Date(offer.expires_at).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Upcoming booking */}
      {feed?.upcoming_booking && (
        <TouchableOpacity
          style={styles.upcomingCard}
          onPress={() => navigation.navigate('BookingDetail', { bookingId: feed.upcoming_booking!.id })}
          activeOpacity={0.8}
        >
          <View style={styles.upcomingHeader}>
            <Text style={styles.sectionTitle}>Upcoming Booking</Text>
            <StatusBadge status={feed.upcoming_booking.status} />
          </View>
          <Text style={styles.upcomingService}>{feed.upcoming_booking.service?.name}</Text>
          <Text style={styles.upcomingPrice}>{formatPrice(feed.upcoming_booking.total_price)}</Text>
        </TouchableOpacity>
      )}

      {/* Featured services */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ServicesTab' as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {feed?.featured_services.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: s.id })}
              activeOpacity={0.8}
            >
              <View style={styles.serviceIconWrap}>
                <Ionicons name="car-sport" size={28} color={colors.accent.blue} />
              </View>
              <Text style={styles.serviceName} numberOfLines={2}>{s.name}</Text>
              <Text style={styles.servicePrice}>{formatPrice(s.price)}</Text>
              <Text style={styles.serviceDuration}>{s.duration_minutes} min</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Gallery */}
      {(feed?.gallery ?? []).length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Before & After</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {feed?.gallery.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={styles.galleryCard}
                onPress={() => navigation.navigate('Gallery')}
                activeOpacity={0.8}
              >
                {g.after_url ? (
                  <Image source={{ uri: g.after_url }} style={styles.galleryImg} />
                ) : (
                  <View style={[styles.galleryImg, { backgroundColor: colors.bg.surface, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="image-outline" size={32} color={colors.text.muted} />
                  </View>
                )}
                {g.caption ? <Text style={styles.galleryCaption} numberOfLines={1}>{g.caption}</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Studio tagline + book CTA */}
      {studio.tagline ? (
        <Text style={styles.tagline}>{studio.tagline}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => navigation.navigate('ServicesTab' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.bg.primary} />
        <Text style={styles.ctaText}>Book a Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  studioLogo: { width: 40, height: 40, borderRadius: 10 },
  studioName: { fontSize: 15, fontWeight: '800', color: colors.text.primary },
  greeting: { fontSize: 12, color: colors.text.muted },
  name: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  loyaltyCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  loyaltyLabel: { fontSize: 12, color: colors.text.muted, marginBottom: 4 },
  loyaltyPoints: { fontSize: typography.sizes.h1, fontWeight: '800', color: colors.accent.blue },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.accent.gold}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: { color: colors.accent.gold, fontWeight: '600', textTransform: 'capitalize' },
  upcomingCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border.active,
  },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upcomingService: { fontSize: 18, fontWeight: '600', color: colors.text.primary },
  upcomingPrice: { fontSize: 16, fontWeight: '700', color: colors.accent.blue },
  section: { gap: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  seeAll: { fontSize: 13, color: colors.accent.blue },
  serviceCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 16,
    width: 160,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: { fontSize: 14, fontWeight: '600', color: colors.text.primary, lineHeight: 20 },
  servicePrice: { fontSize: 16, fontWeight: '700', color: colors.accent.blue },
  serviceDuration: { fontSize: 12, color: colors.text.muted },
  galleryCard: {
    width: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.bg.secondary,
  },
  galleryImg: { width: 160, height: 110 },
  galleryCaption: {
    fontSize: 12,
    color: colors.text.secondary,
    padding: 8,
    backgroundColor: colors.bg.secondary,
  },
  offerCard: {
    backgroundColor: `${colors.accent.gold}15`,
    borderRadius: 16,
    padding: 16,
    width: 150,
    gap: 6,
    borderWidth: 1,
    borderColor: `${colors.accent.gold}40`,
  },
  offerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.accent.gold}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCode: { fontSize: 15, fontWeight: '800', color: colors.accent.gold, letterSpacing: 1 },
  offerDiscount: { fontSize: 13, fontWeight: '700', color: colors.text.primary },
  offerExpiry: { fontSize: 11, color: colors.text.muted },
  ctaBtn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  ctaText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  tagline: { fontSize: 13, color: colors.text.muted, textAlign: 'center', fontStyle: 'italic' },
});
