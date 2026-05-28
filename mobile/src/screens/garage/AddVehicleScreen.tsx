import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGarageStore } from '../../store/garageStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'AddVehicle'>;

export default function AddVehicleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { vehicleId } = route.params ?? {};
  const { vehicles, addVehicle, updateVehicle } = useGarageStore();

  const existing = vehicleId ? vehicles.find((v) => v.id === vehicleId) : undefined;

  const [make, setMake] = useState(existing?.make ?? '');
  const [model, setModel] = useState(existing?.model ?? '');
  const [year, setYear] = useState(existing?.year ? String(existing.year) : '');
  const [color, setColor] = useState(existing?.color ?? '');
  const [plate, setPlate] = useState(existing?.license_plate ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!make || !model || !year || !plate) {
      Alert.alert('Required', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        make, model,
        year: parseInt(year),
        color: color || undefined,
        license_plate: plate,
      };
      if (existing) {
        await updateVehicle(existing.id, payload);
      } else {
        await addVehicle(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to save vehicle.');
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
        <Text style={styles.headerTitle}>{existing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {[
          { label: 'Make *', value: make, setter: setMake, placeholder: 'e.g. Toyota' },
          { label: 'Model *', value: model, setter: setModel, placeholder: 'e.g. Camry' },
          { label: 'Year *', value: year, setter: setYear, placeholder: '2022', keyboardType: 'number-pad' as const },
          { label: 'Color', value: color, setter: setColor, placeholder: 'e.g. Pearl White' },
          { label: 'License Plate *', value: plate, setter: setPlate, placeholder: 'MH 01 AB 1234', autoCapitalize: 'characters' as const },
        ].map(({ label, value, setter, placeholder, keyboardType, autoCapitalize }) => (
          <View key={label} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              placeholderTextColor={colors.text.muted}
              keyboardType={keyboardType ?? 'default'}
              autoCapitalize={autoCapitalize ?? 'words'}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Vehicle'}</Text>
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
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  input: {
    backgroundColor: colors.bg.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border.default, paddingHorizontal: 16, paddingVertical: 14,
    color: colors.text.primary, fontSize: 16,
  },
  saveBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
