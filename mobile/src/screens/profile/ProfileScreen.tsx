import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';
import { useStudioStore } from '../../store/studioStore';
import { authService } from '../../services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, clearAuth } = useAuthStore();
  const studioName = useStudioStore((s) => s.name);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          clearAuth();
        },
      },
    ]);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const customerMenuItems: MenuItem[] = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'car-outline', label: 'My Garage', onPress: () => navigation.navigate('GarageTab') },
    { icon: 'diamond-outline', label: 'Membership', onPress: () => navigation.navigate('Membership') },
    { icon: 'star-outline', label: 'Loyalty Points', onPress: () => navigation.navigate('Loyalty') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: 'log-out-outline', label: 'Logout', onPress: handleLogout, danger: true },
  ];

  const adminMenuItems: MenuItem[] = [
    { icon: 'business-outline', label: 'Studio Profile', onPress: () => navigation.navigate('AdminStudio' as any) },
    { icon: 'calendar-outline', label: 'Manage Slots', onPress: () => navigation.navigate('AdminSlots' as any) },
    { icon: 'pricetag-outline', label: 'Offers & Promos', onPress: () => navigation.navigate('AdminOffers' as any) },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications' as any) },
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile' as any) },
    { icon: 'log-out-outline', label: 'Logout', onPress: handleLogout, danger: true },
  ];

  const menuItems = isAdmin ? adminMenuItems : customerMenuItems;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.full_name ?? 'User'}</Text>
        <Text style={styles.phone}>{user?.phone_number}</Text>
        {user?.membership_tier && (
          <View style={styles.tierBadge}>
            <Ionicons name="diamond" size={12} color={colors.accent.gold} />
            <Text style={styles.tierText}>{user.membership_tier}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.loyalty_points ?? 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.referral_code ?? '—'}</Text>
          <Text style={styles.statLabel}>Ref Code</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color={item.danger ? colors.status.error : colors.accent.blue}
              />
            </View>
            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
            {!item.danger && <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>{studioName} v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48, gap: 24 },
  avatarSection: { alignItems: 'center', gap: 10 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.accent.glow, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.accent.blue,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: colors.accent.blue },
  name: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  phone: { fontSize: 14, color: colors.text.muted },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${colors.accent.gold}20`, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  tierText: { color: colors.accent.gold, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.bg.secondary,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border.default,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: colors.border.default, marginHorizontal: 16 },
  menu: {
    backgroundColor: colors.bg.secondary, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border.default, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.accent.glow, alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: `${colors.status.error}15` },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text.primary },
  menuLabelDanger: { color: colors.status.error },
  version: { textAlign: 'center', fontSize: 12, color: colors.text.muted },
});
