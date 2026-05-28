import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../app/navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const { hasSeenOnboarding } = useAuthStore();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, { duration: 800 });
    const timer = setTimeout(() => {
      if (hasSeenOnboarding) {
        navigation.replace('PhoneLogin');
      } else {
        navigation.replace('Onboarding');
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, animatedStyle]}>
        <Text style={styles.logo}>A</Text>
        <Text style={styles.brand}>AUTOSHINE</Text>
        <Text style={styles.tagline}>Premium Car Detailing</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: { alignItems: 'center', gap: 12 },
  logo: {
    fontSize: 80,
    fontWeight: '800',
    color: colors.accent.blue,
    letterSpacing: -2,
  },
  brand: {
    fontSize: typography.sizes.h1,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: typography.sizes.body,
    color: colors.text.muted,
    letterSpacing: 2,
  },
});
