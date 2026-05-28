import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../app/navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;
type Route = RouteProp<AuthStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone } = route.params;
  const { setUser } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleChange = (text: string, idx: number) => {
    if (!/^\d*$/.test(text)) return;
    const next = [...otp];
    next[idx] = text;
    setOtp(next);
    if (text && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every((d) => d) && text) verify(next.join(''));
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const verify = async (code: string) => {
    setLoading(true);
    try {
      const res = await authService.verifyOtp(phone, code);
      setUser(res.user);
      if (res.is_new_user) {
        navigation.replace('ProfileSetup');
      }
      // RootNavigator will redirect based on auth state
    } catch (e: any) {
      Alert.alert('Invalid OTP', e?.response?.data?.detail ?? 'Wrong code. Try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await authService.sendOtp(phone);
      setCountdown(30);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>+91 {phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { if (el) inputs.current[i] = el; }}
              style={[styles.otpBox, digit ? styles.otpFilled : null]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {loading && <Text style={styles.verifying}>Verifying...</Text>}

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.countdown}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={resend}>
              <Text style={styles.resendBtn}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  back: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  backText: { color: colors.accent.blue, fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', gap: 24 },
  title: { fontSize: typography.sizes.h1, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: typography.sizes.body, color: colors.text.secondary, lineHeight: 24 },
  phone: { color: colors.text.primary, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 8 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.bg.surface,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  otpFilled: { borderColor: colors.accent.blue },
  verifying: { color: colors.accent.blue, textAlign: 'center', fontSize: 14 },
  resendRow: { alignItems: 'center' },
  countdown: { color: colors.text.muted, fontSize: 14 },
  resendBtn: { color: colors.accent.blue, fontSize: 14, fontWeight: '600' },
});
