import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useBookingStore } from '../../store/bookingStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import ProgressStepper from '../../components/ui/ProgressStepper';
import { formatPrice } from '../../utils/formatters';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export default function BookingStep3Screen() {
  const navigation = useNavigation<Nav>();
  const { draft, toggleAddon, setNotes, setPromoCode } = useBookingStore();
  const addons = draft.service?.addons ?? [];
  const [promoInput, setPromoInput] = useState(draft.promoCode ?? '');

  const isSelected = (id: number) => draft.selectedAddons.some((a) => a.id === id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressStepper currentStep={3} totalSteps={4} labels={['Vehicle', 'Date', 'Add-ons', 'Confirm']} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Customize Your Service</Text>

        {addons.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Add-ons</Text>
            {addons.map((a) => {
              const sel = isSelected(a.id);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.addonCard, sel && styles.addonCardSelected]}
                  onPress={() => toggleAddon(a)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.addonName}>{a.name}</Text>
                    {a.description ? (
                      <Text style={styles.addonDesc} numberOfLines={2}>{a.description}</Text>
                    ) : null}
                    <Text style={styles.addonPrice}>+{formatPrice(a.price)}</Text>
                  </View>
                  <View style={[styles.checkbox, sel && styles.checkboxSelected]}>
                    {sel && <Ionicons name="checkmark" size={16} color={colors.bg.primary} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <Text style={styles.noAddons}>No add-ons available for this service</Text>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Promo Code</Text>
        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            placeholderTextColor={colors.text.muted}
            value={promoInput}
            onChangeText={setPromoInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setPromoCode(promoInput.trim() || undefined)}
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Notes for Technician</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any special instructions or areas of concern..."
          placeholderTextColor={colors.text.muted}
          value={draft.notes ?? ''}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => navigation.navigate('BookingStep4')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Review Booking</Text>
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
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 16 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  sectionTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  addonCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  addonCardSelected: { borderColor: colors.accent.blue },
  addonName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  addonDesc: { fontSize: 13, color: colors.text.muted },
  addonPrice: { fontSize: 14, fontWeight: '700', color: colors.accent.blue },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  noAddons: { color: colors.text.muted, fontSize: 14 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text.primary,
    fontSize: 15,
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  applyText: { color: colors.bg.primary, fontWeight: '700' },
  notesInput: {
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text.primary,
    fontSize: 15,
    minHeight: 100,
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: colors.bg.primary },
  nextBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
