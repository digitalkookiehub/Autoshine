import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGarageStore } from '../../store/garageStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import ProgressStepper from '../../components/ui/ProgressStepper';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export default function BookingStep1Screen() {
  const navigation = useNavigation<Nav>();
  const { vehicles, selectedVehicle, selectVehicle, loadVehicles } = useGarageStore();

  useEffect(() => { loadVehicles(); }, []);

  const proceed = () => {
    if (!selectedVehicle) return;
    navigation.navigate('BookingStep2');
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

      <ProgressStepper currentStep={1} totalSteps={4} labels={['Vehicle', 'Date', 'Add-ons', 'Confirm']} />

      <View style={styles.content}>
        <Text style={styles.title}>Select Your Vehicle</Text>
        <Text style={styles.subtitle}>Choose which car to detail</Text>

        <FlatList
          data={vehicles}
          keyExtractor={(v) => String(v.id)}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => {
            const selected = selectedVehicle?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.vehicleCard, selected && styles.vehicleCardSelected]}
                onPress={() => selectVehicle(item)}
                activeOpacity={0.8}
              >
                <View style={styles.vehicleIcon}>
                  <Ionicons name="car" size={28} color={selected ? colors.accent.blue : colors.text.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>{item.make} {item.model}</Text>
                  <Text style={styles.vehicleInfo}>{item.year} · {item.color} · {item.license_plate}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={24} color={colors.accent.blue} />}
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addVehicleBtn}
              onPress={() => navigation.navigate('AddVehicle', {})}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.accent.blue} />
              <Text style={styles.addVehicleText}>Add New Vehicle</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !selectedVehicle && styles.nextBtnDisabled]}
          onPress={proceed}
          disabled={!selectedVehicle}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Next: Choose Date</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.bg.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 16 },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.muted },
  vehicleCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  vehicleCardSelected: { borderColor: colors.accent.blue, backgroundColor: colors.accent.glow },
  vehicleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  vehicleInfo: { fontSize: 13, color: colors.text.muted, marginTop: 3 },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.accent.blue,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginTop: 4,
  },
  addVehicleText: { color: colors.accent.blue, fontSize: 14, fontWeight: '600' },
  footer: { padding: 20, paddingBottom: 36 },
  nextBtn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
