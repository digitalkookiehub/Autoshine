import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGarageStore } from '../../store/garageStore';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import { UserVehicle } from '../../types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export default function GarageScreen() {
  const navigation = useNavigation<Nav>();
  const { vehicles, loadVehicles, deleteVehicle } = useGarageStore();

  useEffect(() => { loadVehicles(); }, []);

  const confirmDelete = (v: UserVehicle) => {
    Alert.alert(
      'Remove Vehicle',
      `Remove ${v.make} ${v.model} from your garage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteVehicle(v.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Garage</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddVehicle', {})}
        >
          <Ionicons name="add" size={22} color={colors.bg.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: v }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="car" size={28} color={colors.accent.blue} />
              </View>
              <View>
                <Text style={styles.vehicleName}>{v.make} {v.model}</Text>
                <Text style={styles.vehicleInfo}>{v.year} · {v.color}</Text>
                <Text style={styles.plate}>{v.license_plate}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddVehicle', { vehicleId: v.id })}
                style={styles.actionBtn}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(v)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptySubtitle}>Add your car to start booking</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddVehicle', {})}
            >
              <Text style={styles.emptyBtnText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
  },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.accent.blue, alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconWrap: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: colors.accent.glow, alignItems: 'center', justifyContent: 'center',
  },
  vehicleName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  vehicleInfo: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  plate: {
    fontSize: 12, color: colors.accent.blue, fontWeight: '700',
    marginTop: 4, letterSpacing: 1,
  },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.bg.surface, alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  emptySubtitle: { fontSize: 14, color: colors.text.muted },
  emptyBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  emptyBtnText: { color: colors.bg.primary, fontWeight: '700', fontSize: 15 },
});
