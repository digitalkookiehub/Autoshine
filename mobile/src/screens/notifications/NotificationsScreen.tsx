import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { Notification } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<Notification[]>('notifications');
      setNotifications(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await api.put(`notifications/${id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await api.put('notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAll}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />
        }
        renderItem={({ item: n }) => (
          <TouchableOpacity
            style={[styles.card, !n.is_read && styles.cardUnread]}
            onPress={() => markRead(n.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, n.is_read ? styles.dotRead : styles.dotUnread]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.body}</Text>
              <Text style={styles.notifTime}>{formatRelativeTime(n.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={colors.text.muted} />
            <Text style={styles.emptyText}>No notifications</Text>
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
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  markAll: { fontSize: 13, color: colors.accent.blue },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: colors.bg.secondary, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border.default,
  },
  cardUnread: { borderColor: colors.accent.blue, backgroundColor: `${colors.accent.blue}08` },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  dotUnread: { backgroundColor: colors.accent.blue },
  dotRead: { backgroundColor: colors.border.default },
  notifTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  notifBody: { fontSize: 13, color: colors.text.secondary, lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: colors.text.muted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: colors.text.muted },
});
