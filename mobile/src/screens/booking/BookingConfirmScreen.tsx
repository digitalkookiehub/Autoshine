import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { formatPrice, formatDate, formatTime } from '../../utils/formatters';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'BookingConfirm'>;

export default function BookingConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * 20 }],
  }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    api.get<Booking>(`bookings/${bookingId}`).then(({ data }) => setBooking(data));
  }, [bookingId]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Ionicons name="checkmark-circle" size={80} color={colors.accent.blue} />
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your appointment is set. We'll notify you before the session.</Text>

        {booking ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Booking #</Text>
              <Text style={styles.rowValue}>#{booking.id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Service</Text>
              <Text style={styles.rowValue}>{booking.service?.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>{booking.slot ? formatDate(booking.slot.date) : '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Time</Text>
              <Text style={styles.rowValue}>{booking.slot ? formatTime(booking.slot.start_time) : '—'}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(booking.total_price)}</Text>
            </View>
          </View>
        ) : (
          <ActivityIndicator color={colors.accent.blue} />
        )}

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => navigation.navigate('BookingDetail', { bookingId })}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBtnText}>View Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Tabs' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.homeLink}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { width: '100%', alignItems: 'center', gap: 20 },
  title: { fontSize: typography.sizes.h1, fontWeight: '800', color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  card: {
    width: '100%',
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: colors.text.muted },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.accent.blue },
  viewBtn: {
    width: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  homeLink: { color: colors.text.muted, fontSize: 14, paddingVertical: 8 },
});
