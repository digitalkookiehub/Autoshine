import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  style,
  innerStyle,
}) => (
  <BlurView
    intensity={intensity}
    tint="dark"
    style={[
      {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
      },
      style,
    ]}
  >
    <View style={[{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16 }, innerStyle]}>
      {children}
    </View>
  </BlurView>
);
