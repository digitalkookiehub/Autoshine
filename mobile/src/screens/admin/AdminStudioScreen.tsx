import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { useStudioStore } from '../../store/studioStore';

export default function AdminStudioScreen() {
  const navigation = useNavigation();
  const studio = useStudioStore();

  const [name, setName] = useState(studio.name);
  const [tagline, setTagline] = useState(studio.tagline ?? '');
  const [phone, setPhone] = useState(studio.phone ?? '');
  const [address, setAddress] = useState(studio.address ?? '');
  const [email, setEmail] = useState(studio.email ?? '');
  const [logoUri, setLogoUri] = useState<string | null>(studio.logo_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload a logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setLogoUri(asset.uri);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: 'logo.jpg',
      } as any);
      const { data } = await api.post<{ logo_url: string }>('admin/studio/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogoUri(data.logo_url);
      studio.update({ logo_url: data.logo_url });
      Alert.alert('Success', 'Logo updated!');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Logo upload failed';
      Alert.alert('Upload Failed', msg);
      setLogoUri(studio.logo_url);
    }
    setUploading(false);
  };

  const save = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Studio name is required'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('admin/studio', {
        name: name.trim(),
        tagline: tagline.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        email: email.trim() || null,
      });
      studio.update(data);
      Alert.alert('Saved', 'Studio profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Studio Profile</Text>
        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDim]} onPress={save} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={colors.bg.primary} />
            : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Logo picker */}
        <View style={styles.logoSection}>
          <TouchableOpacity style={styles.logoWrap} onPress={pickLogo} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="large" color={colors.accent.blue} />
            ) : logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="image-outline" size={40} color={colors.text.muted} />
                <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickLogo} disabled={uploading}>
            <Text style={styles.changeLogoText}>
              {uploading ? 'Uploading...' : logoUri ? 'Change Logo' : 'Upload Logo'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.logoHint}>Square image recommended (1:1). Shown app-wide.</Text>
        </View>

        {/* Text fields */}
        <View style={styles.fields}>
          <Text style={styles.label}>Studio Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Autoshine Studio"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Tagline</Text>
          <TextInput
            style={styles.input}
            value={tagline}
            onChangeText={setTagline}
            placeholder="e.g. Premium car detailing, done right"
            placeholderTextColor={colors.text.muted}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={colors.text.muted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="studio@autoshine.com"
            placeholderTextColor={colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={address}
            onChangeText={setAddress}
            placeholder="123 Studio Lane, Chennai, Tamil Nadu"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Preview card */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewCard}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.previewLogo} />
            ) : (
              <View style={styles.previewLogoPlaceholder}>
                <Ionicons name="car-sport" size={24} color={colors.accent.blue} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.previewName}>{name || 'Studio Name'}</Text>
              {tagline ? <Text style={styles.previewTagline}>{tagline}</Text> : null}
              {phone ? (
                <View style={styles.previewRow}>
                  <Ionicons name="call-outline" size={12} color={colors.text.muted} />
                  <Text style={styles.previewMeta}>{phone}</Text>
                </View>
              ) : null}
              {address ? (
                <View style={styles.previewRow}>
                  <Ionicons name="location-outline" size={12} color={colors.text.muted} />
                  <Text style={styles.previewMeta} numberOfLines={1}>{address}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  saveBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 8, minWidth: 60, alignItems: 'center',
  },
  saveBtnDim: { opacity: 0.6 },
  saveBtnText: { color: colors.bg.primary, fontWeight: '700', fontSize: 14 },
  body: { paddingHorizontal: 20, paddingBottom: 48, gap: 28 },

  logoSection: { alignItems: 'center', gap: 10, paddingTop: 8 },
  logoWrap: {
    width: 120, height: 120, borderRadius: 24,
    backgroundColor: colors.bg.secondary, borderWidth: 2, borderColor: colors.border.default,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logoImg: { width: 120, height: 120 },
  logoPlaceholder: { alignItems: 'center', gap: 6 },
  logoPlaceholderText: { fontSize: 12, color: colors.text.muted },
  changeLogoText: { fontSize: 14, fontWeight: '600', color: colors.accent.blue },
  logoHint: { fontSize: 11, color: colors.text.muted },

  fields: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginTop: 10 },
  input: {
    backgroundColor: colors.bg.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.default,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },

  previewSection: { gap: 12 },
  previewTitle: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary },
  previewCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border.default, flexDirection: 'row', gap: 14, alignItems: 'center',
  },
  previewLogo: { width: 56, height: 56, borderRadius: 12 },
  previewLogoPlaceholder: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: colors.accent.glow,
    alignItems: 'center', justifyContent: 'center',
  },
  previewName: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 2 },
  previewTagline: { fontSize: 12, color: colors.text.muted, marginBottom: 6, fontStyle: 'italic' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  previewMeta: { fontSize: 11, color: colors.text.muted, flex: 1 },
});
