import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { TimeSlot } from '../../types';
import { useBookingStore } from '../../store/bookingStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import ProgressStepper from '../../components/ui/ProgressStepper';
import { formatTime, formatDate } from '../../utils/formatters';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

function getDatesForward(days = 14) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function BookingStep2Screen() {
  const navigation = useNavigation<Nav>();
  const { draft, setSlot } = useBookingStore();
  const [dates] = useState(getDatesForward());
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlotLocal] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSlots = async (date: Date) => {
    setLoading(true);
    setSlots([]);
    setSelectedSlotLocal(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await api.get<TimeSlot[]>('slots', {
        params: { date: dateStr, service_id: draft.service?.id },
      });
      setSlots(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadSlots(selectedDate); }, [selectedDate]);

  const proceed = () => {
    if (!selectedSlot) return;
    setSlot(selectedSlot);
    navigation.navigate('BookingStep3');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressStepper currentStep={2} totalSteps={4} labels={['Vehicle', 'Date', 'Add-ons', 'Confirm']} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Pick a Date</Text>

        <FlatList
          horizontal
          data={dates}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, marginBottom: 24 }}
          keyExtractor={(d) => d.toISOString()}
          renderItem={({ item: d }) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <TouchableOpacity
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={[styles.dateDow, isSelected && styles.dateTextSelected]}>
                  {d.toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                  {d.getDate()}
                </Text>
                {isToday && <Text style={styles.todayDot}>•</Text>}
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.sectionTitle}>Available Slots</Text>
        <Text style={styles.dateLabel}>{formatDate(selectedDate.toISOString())}</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent.blue} size="large" style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.slotsGrid}>
            {slots.filter((s) => s.is_available).map((slot) => {
              const sel = selectedSlot?.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotChip, sel && styles.slotChipSelected]}
                  onPress={() => setSelectedSlotLocal(slot)}
                >
                  <Text style={[styles.slotTime, sel && styles.slotTimeSelected]}>
                    {formatTime(slot.start_time)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {!loading && slots.filter((s) => s.is_available).length === 0 && (
              <Text style={styles.noSlots}>No available slots for this day</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !selectedSlot && styles.nextBtnDisabled]}
          onPress={proceed}
          disabled={!selectedSlot}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Next: Add-ons</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.bg.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary, marginBottom: 20 },
  dateCard: {
    width: 56,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dateCardSelected: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  dateDow: { fontSize: 11, color: colors.text.muted, fontWeight: '500' },
  dateDay: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  dateTextSelected: { color: colors.bg.primary },
  todayDot: { color: colors.accent.blue, fontSize: 18, lineHeight: 14 },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  dateLabel: { fontSize: 13, color: colors.text.muted, marginBottom: 16, marginTop: 4 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    minWidth: 96,
    alignItems: 'center',
  },
  slotChipSelected: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  slotTime: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  slotTimeSelected: { color: colors.bg.primary },
  noSlots: { color: colors.text.muted, fontSize: 14, marginTop: 16, width: '100%' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: colors.bg.primary },
  nextBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
