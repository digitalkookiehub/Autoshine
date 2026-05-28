import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { authService } from '../../services/auth.service';
import { AuthStackParamList } from '../../app/navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'PhoneLogin'>;

export default function PhoneLoginScreen() {
  const navigation = useNavigation<Nav>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.sendOtp(cleaned);
      if (res?.debug_code) {
        Alert.alert('Dev Mode OTP', `Your OTP is: ${res.debug_code}`, [
          { text: 'OK', onPress: () => navigation.navigate('OtpVerify', { phone: cleaned }) },
        ]);
      } else {
        navigation.navigate('OtpVerify', { phone: cleaned });
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>A</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.code}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={13}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.btnText}>Sending...</Text>
            ) : (
              <>
                <Text style={styles.btnText}>Send OTP</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.bg.primary} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40, gap: 12 },
  logo: { fontSize: 56, fontWeight: '800', color: colors.accent.blue },
  title: { fontSize: typography.sizes.h2, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: typography.sizes.body, color: colors.text.secondary },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
  flag: { fontSize: 20 },
  code: { color: colors.text.primary, fontWeight: '600' },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    letterSpacing: 1,
  },
  btn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 12, color: colors.text.muted, textAlign: 'center', lineHeight: 18 },
  link: { color: colors.accent.blue },
});
