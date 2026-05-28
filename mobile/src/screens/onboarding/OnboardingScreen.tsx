import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../app/navigation/AuthNavigator';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const slides = [
  {
    id: '1',
    icon: 'car-sport',
    title: 'Premium Detailing\nAt Your Fingertips',
    subtitle: 'Book luxury car detailing services with just a few taps.',
  },
  {
    id: '2',
    icon: 'sparkles',
    title: 'Expert Technicians\nEvery Time',
    subtitle: 'Certified professionals who treat your car like royalty.',
  },
  {
    id: '3',
    icon: 'shield-checkmark',
    title: 'Track Your Booking\nIn Real Time',
    subtitle: 'Live status updates from booking to completion.',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { setHasSeenOnboarding } = useAuthStore();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const goToLogin = () => {
    setHasSeenOnboarding(true);
    navigation.replace('PhoneLogin');
  };

  const next = () => {
    if (index < slides.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      goToLogin();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={80} color={colors.accent.blue} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(i) => i.id}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.8}>
          <Text style={styles.btnText}>
            {index === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.bg.primary} />
        </TouchableOpacity>

        {index < slides.length - 1 && (
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 48, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border.default },
  dotActive: { width: 24, backgroundColor: colors.accent.blue },
  btn: {
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
  skip: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
});
