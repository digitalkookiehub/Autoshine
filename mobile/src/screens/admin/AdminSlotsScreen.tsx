import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';

export default function AdminSlotsScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [duration, setDuration] = useState('60');
  const [capacity, setCapacity] = useState('2');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!startDate || !endDate || !startTime || !endTime || !duration || !capacity) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ slots_created: number }>('admin/slots/generate', {
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        slot_duration_minutes: parseInt(duration),
        capacity: parseInt(capacity),
      });
      Alert.alert('Success', `${data.slots_created} slots created.`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to generate slots.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Time Slots</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.info}>
          Create available booking slots for a date range. Slots are created at regular intervals between the start and end times.
        </Text>

        {[
          { label: 'Start Date', value: startDate, setter: setStartDate, placeholder: 'YYYY-MM-DD' },
          { label: 'End Date', value: endDate, setter: setEndDate, placeholder: 'YYYY-MM-DD' },
          { label: 'Day Start Time', value: startTime, setter: setStartTime, placeholder: '09:00' },
          { label: 'Day End Time', value: endTime, setter: setEndTime, placeholder: '18:00' },
          { label: 'Slot Duration (minutes)', value: duration, setter: setDuration, placeholder: '60', keyboardType: 'number-pad' as const },
          { label: 'Capacity per Slot', value: capacity, setter: setCapacity, placeholder: '2', keyboardType: 'number-pad' as const },
        ].map(({ label, value, setter, placeholder, keyboardType }) => (
          <View key={label} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              placeholderTextColor={colors.text.muted}
              keyboardType={keyboardType ?? 'default'}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.generateBtn, loading && { opacity: 0.6 }]}
          onPress={generate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.bg.primary} />
          <Text style={styles.generateBtnText}>{loading ? 'Generating...' : 'Generate Slots'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 16 },
  info: {
    fontSize: 14, color: colors.text.secondary, lineHeight: 20,
    backgroundColor: colors.bg.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border.default,
  },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  input: {
    backgroundColor: colors.bg.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border.default, paddingHorizontal: 16, paddingVertical: 14,
    color: colors.text.primary, fontSize: 16,
  },
  generateBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
  },
  generateBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
