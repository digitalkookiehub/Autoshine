import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, RefreshControl, Alert, Switch, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';

interface Offer {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
}

interface FormState {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  max_uses: string;
  expires_at: string;
}

const EMPTY_FORM: FormState = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  max_uses: '',
  expires_at: '',
};

export default function AdminOffersScreen() {
  const navigation = useNavigation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<Offer[]>('admin/offers');
      setOffers(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.code.trim()) { Alert.alert('Error', 'Promo code is required'); return; }
    if (!form.discount_value || isNaN(Number(form.discount_value))) {
      Alert.alert('Error', 'Enter a valid discount value');
      return;
    }
    setSaving(true);
    try {
      await api.post('admin/offers', {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      });
      setModalVisible(false);
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Failed to create offer';
      Alert.alert('Error', msg);
    }
    setSaving(false);
  };

  const toggle = async (offer: Offer) => {
    try {
      await api.patch(`admin/offers/${offer.id}/toggle`);
      setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
    } catch {
      Alert.alert('Error', 'Could not update offer');
    }
  };

  const remove = (offer: Offer) => {
    Alert.alert('Delete Offer', `Delete "${offer.code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`admin/offers/${offer.id}`).catch(() => {});
          setOffers((prev) => prev.filter((o) => o.id !== offer.id));
        },
      },
    ]);
  };

  const discountLabel = (o: Offer) =>
    o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Offers & Promo Codes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <Ionicons name="add" size={22} color={colors.bg.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />
        }
        renderItem={({ item: o }) => (
          <View style={[styles.card, !o.is_active && styles.cardInactive]}>
            <View style={styles.cardTop}>
              <View style={styles.codeWrap}>
                <Ionicons name="pricetag" size={16} color={o.is_active ? colors.accent.gold : colors.text.muted} />
                <Text style={[styles.code, !o.is_active && styles.codeDim]}>{o.code}</Text>
              </View>
              <Switch
                value={o.is_active}
                onValueChange={() => toggle(o)}
                trackColor={{ false: colors.bg.surface, true: `${colors.accent.blue}60` }}
                thumbColor={o.is_active ? colors.accent.blue : colors.text.muted}
              />
            </View>

            <Text style={styles.discount}>{discountLabel(o)}</Text>

            <View style={styles.meta}>
              <Text style={styles.metaText}>
                Uses: {o.uses_count}{o.max_uses ? ` / ${o.max_uses}` : ''}
              </Text>
              {o.expires_at && (
                <Text style={styles.metaText}>
                  Expires: {new Date(o.expires_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(o)}>
              <Ionicons name="trash-outline" size={16} color={colors.status.error} />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="pricetag-outline" size={56} color={colors.text.muted} />
            <Text style={styles.emptyText}>No offers yet</Text>
            <Text style={styles.emptyHint}>Tap + to create your first promo code</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Promo Code</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.label}>Code *</Text>
              <TextInput
                style={styles.input}
                value={form.code}
                onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
                placeholder="e.g. WELCOME20"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Discount Type</Text>
              <View style={styles.typeRow}>
                {(['percentage', 'fixed'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, form.discount_type === t && styles.typeChipActive]}
                    onPress={() => setForm({ ...form, discount_type: t })}
                  >
                    <Text style={[styles.typeChipText, form.discount_type === t && styles.typeChipTextActive]}>
                      {t === 'percentage' ? '% Percentage' : '₹ Fixed Amount'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>
                {form.discount_type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'} *
              </Text>
              <TextInput
                style={styles.input}
                value={form.discount_value}
                onChangeText={(v) => setForm({ ...form, discount_value: v })}
                placeholder={form.discount_type === 'percentage' ? '20' : '500'}
                placeholderTextColor={colors.text.muted}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Max Uses (optional)</Text>
              <TextInput
                style={styles.input}
                value={form.max_uses}
                onChangeText={(v) => setForm({ ...form, max_uses: v })}
                placeholder="Leave empty for unlimited"
                placeholderTextColor={colors.text.muted}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Expiry Date (optional)</Text>
              <TextInput
                style={styles.input}
                value={form.expires_at}
                onChangeText={(v) => setForm({ ...form, expires_at: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.muted}
              />

              <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDim]} onPress={save} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Creating...' : 'Create Offer'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.accent.blue, alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardInactive: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: { fontSize: 16, fontWeight: '800', color: colors.accent.gold, letterSpacing: 1 },
  codeDim: { color: colors.text.muted },
  discount: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
  meta: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 12, color: colors.text.muted },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  deleteText: { fontSize: 13, color: colors.status.error },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text.muted },
  emptyHint: { fontSize: 13, color: colors.text.muted },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: colors.bg.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  modalTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  modalBody: { padding: 20, gap: 8, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginTop: 8 },
  input: {
    backgroundColor: colors.bg.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.default,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginVertical: 4 },
  typeChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default,
    alignItems: 'center',
  },
  typeChipActive: { borderColor: colors.accent.blue, backgroundColor: `${colors.accent.blue}15` },
  typeChipText: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  typeChipTextActive: { color: colors.accent.blue, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 16,
  },
  saveBtnDim: { opacity: 0.6 },
  saveBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
