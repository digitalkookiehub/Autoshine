import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

interface Field {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  required?: boolean;
  icon: string;
}

export default function ProfileSetupScreen() {
  const { setUser } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.updateProfile({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        alternate_phone: alternatePhone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setUser(user);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      label: 'Full Name',
      placeholder: 'Enter your full name',
      value: fullName,
      onChange: setFullName,
      autoCapitalize: 'words',
      required: true,
      icon: 'person-outline',
    },
    {
      label: 'Email Address',
      placeholder: 'you@example.com',
      value: email,
      onChange: setEmail,
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      icon: 'mail-outline',
    },
    {
      label: 'Alternate Phone Number',
      placeholder: '+91 XXXXX XXXXX',
      value: alternatePhone,
      onChange: setAlternatePhone,
      keyboardType: 'phone-pad',
      icon: 'call-outline',
    },
    {
      label: 'Address',
      placeholder: 'Street, City, State',
      value: address,
      onChange: setAddress,
      autoCapitalize: 'sentences',
      icon: 'location-outline',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="person-circle-outline" size={56} color={colors.accent.blue} />
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself to get started</Text>
        </View>

        <View style={styles.card}>
          {fields.map((f) => (
            <View key={f.label} style={styles.field}>
              <Text style={styles.label}>
                {f.label}
                {f.required && <Text style={styles.required}> *</Text>}
              </Text>
              <View style={styles.inputWrap}>
                <Ionicons name={f.icon as any} size={18} color={colors.text.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.text.muted}
                  value={f.value}
                  onChangeText={f.onChange}
                  keyboardType={f.keyboardType ?? 'default'}
                  autoCapitalize={f.autoCapitalize ?? 'sentences'}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>{loading ? 'Saving...' : 'Continue'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32, gap: 8 },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.accent.glow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: typography.sizes.body, color: colors.text.secondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 20, padding: 24, gap: 20,
    borderWidth: 1, borderColor: colors.border.default,
  },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  required: { color: colors.status.error },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, paddingVertical: 14,
    color: colors.text.primary, fontSize: 15,
  },
  btn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { color: colors.text.muted, fontSize: 14 },
});
