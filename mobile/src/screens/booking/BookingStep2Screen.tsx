import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { TimeSlot } from '../../types';
import { useBookingStore } from '../../store/bookingStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import ProgressStepper from '../../components/ui/ProgressStepper';
import { formatTime } from '../../utils/formatters';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BookingStep2Screen() {
  const navigation = useNavigation<Nav>();
  const { draft, setSlot } = useBookingStore();
  const today = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlotLocal] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const loadSlots = async (dateStr: string) => {
    setLoading(true);
    setSlots([]);
    setSelectedSlotLocal(null);
    try {
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

  const availableSlots = slots.filter((s) => s.is_available);

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
        <Text style={styles.title}>Pick a Date & Time</Text>

        {/* Date selector card */}
        <TouchableOpacity style={styles.dateSelector} onPress={() => setCalendarOpen(true)} activeOpacity={0.8}>
          <View style={styles.dateSelectorLeft}>
            <Ionicons name="calendar" size={22} color={colors.accent.blue} />
            <View>
              <Text style={styles.dateSelectorLabel}>Selected Date</Text>
              <Text style={styles.dateSelectorValue}>{formatDisplayDate(selectedDate)}</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.text.muted} />
        </TouchableOpacity>

        {/* Time slots */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>

          {loading ? (
            <ActivityIndicator color={colors.accent.blue} size="large" style={{ marginTop: 32 }} />
          ) : availableSlots.length === 0 ? (
            <View style={styles.noSlotsWrap}>
              <Ionicons name="time-outline" size={40} color={colors.text.muted} />
              <Text style={styles.noSlots}>No slots available for this day</Text>
              <Text style={styles.noSlotsHint}>Try selecting a different date</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => {
                const sel = selectedSlot?.id === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotChip, sel && styles.slotChipSelected]}
                    onPress={() => setSelectedSlotLocal(slot)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={sel ? colors.bg.primary : colors.text.muted}
                    />
                    <Text style={[styles.slotTime, sel && styles.slotTimeSelected]}>
                      {formatTime(slot.start_time)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
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

      {/* Calendar Modal */}
      <Modal visible={calendarOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setCalendarOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Calendar
              current={selectedDate}
              minDate={today}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarOpen(false);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: colors.accent.blue },
              }}
              theme={{
                backgroundColor: colors.bg.secondary,
                calendarBackground: colors.bg.secondary,
                textSectionTitleColor: colors.text.muted,
                selectedDayBackgroundColor: colors.accent.blue,
                selectedDayTextColor: colors.bg.primary,
                todayTextColor: colors.accent.blue,
                dayTextColor: colors.text.primary,
                textDisabledColor: colors.text.muted,
                dotColor: colors.accent.blue,
                monthTextColor: colors.text.primary,
                arrowColor: colors.accent.blue,
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
              }}
            />
          </View>
        </View>
      </Modal>
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
  dateSelector: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: colors.accent.blue,
    marginBottom: 28,
  },
  dateSelectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  dateSelectorLabel: { fontSize: 11, color: colors.text.muted, marginBottom: 2 },
  dateSelectorValue: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  slotsSection: { gap: 16 },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 12, backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.default,
    minWidth: 100,
  },
  slotChipSelected: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  slotTime: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  slotTimeSelected: { color: colors.bg.primary },
  noSlotsWrap: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  noSlots: { color: colors.text.secondary, fontSize: 15, fontWeight: '600' },
  noSlotsHint: { color: colors.text.muted, fontSize: 13 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36, backgroundColor: colors.bg.primary,
  },
  nextBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
});
