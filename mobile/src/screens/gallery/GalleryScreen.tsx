import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, Modal, Dimensions, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { GalleryItem } from '../../types';

const { width } = Dimensions.get('window');
const IMG_SIZE = (width - 52) / 2;

export default function GalleryScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAfter, setShowAfter] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get<GalleryItem[]>('gallery');
      setItems(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Before & After</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent.blue} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => setSelected(item)}
            activeOpacity={0.85}
          >
            {item.after_url ? (
              <Image source={{ uri: item.after_url }} style={styles.gridImg} />
            ) : (
              <View style={[styles.gridImg, styles.placeholder]}>
                <Ionicons name="image-outline" size={32} color={colors.text.muted} />
              </View>
            )}
            {item.caption ? (
              <Text style={styles.caption} numberOfLines={1}>{item.caption}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={56} color={colors.text.muted} />
            <Text style={styles.emptyText}>No gallery items yet</Text>
          </View>
        }
      />

      {/* Lightbox */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.lightboxBg}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, !showAfter && styles.toggleBtnActive]}
              onPress={() => setShowAfter(false)}
            >
              <Text style={[styles.toggleLabel, !showAfter && styles.toggleLabelActive]}>Before</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, showAfter && styles.toggleBtnActive]}
              onPress={() => setShowAfter(true)}
            >
              <Text style={[styles.toggleLabel, showAfter && styles.toggleLabelActive]}>After</Text>
            </TouchableOpacity>
          </View>

          {selected && (showAfter ? selected.after_url : selected.before_url) ? (
            <Image
              source={{ uri: showAfter ? selected.after_url! : selected.before_url! }}
              style={styles.lightboxImg}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.lightboxPlaceholder}>
              <Ionicons name="image-outline" size={64} color={colors.text.muted} />
              <Text style={styles.noImgText}>No {showAfter ? 'after' : 'before'} image</Text>
            </View>
          )}

          {selected?.caption ? (
            <Text style={styles.lightboxCaption}>{selected.caption}</Text>
          ) : null}
        </View>
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
  grid: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  gridItem: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.bg.secondary },
  gridImg: { width: '100%', height: IMG_SIZE },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.surface },
  caption: { fontSize: 12, color: colors.text.secondary, padding: 8 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: colors.text.muted },
  lightboxBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },
  lightboxClose: { position: 'absolute', top: 56, right: 20, padding: 8 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  toggleBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleBtnActive: { backgroundColor: colors.accent.blue },
  toggleLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  toggleLabelActive: { color: '#0A0A0A' },
  lightboxImg: { width: width - 40, height: width - 40 },
  lightboxPlaceholder: { alignItems: 'center', gap: 12 },
  noImgText: { color: colors.text.muted },
  lightboxCaption: {
    color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center',
    marginTop: 16, paddingHorizontal: 32,
  },
});
