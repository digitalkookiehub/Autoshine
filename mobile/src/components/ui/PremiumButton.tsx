import React from 'react';
import { Text, Pressable, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'lg',
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { stiffness: 300 }, () => {
      scale.value = withSpring(1, { stiffness: 300 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const bgColor =
    variant === 'primary'
      ? colors.accent.blue
      : variant === 'secondary'
      ? colors.bg.surface
      : 'transparent';

  const txtColor =
    variant === 'primary' ? colors.text.inverse : colors.text.primary;

  const paddingV = size === 'sm' ? 10 : size === 'md' ? 14 : 18;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          {
            backgroundColor: bgColor,
            borderRadius: 16,
            paddingVertical: paddingV,
            alignItems: 'center',
            borderWidth: variant === 'outline' ? 1 : 0,
            borderColor: colors.accent.blue,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={txtColor} size="small" />
        ) : (
          <Text
            style={[
              { color: txtColor, fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
              textStyle,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};
