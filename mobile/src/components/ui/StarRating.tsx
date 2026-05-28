import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRate,
}) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {Array.from({ length: maxRating }, (_, i) => (
      <Pressable key={i} onPress={() => interactive && onRate?.(i + 1)}>
        <Ionicons
          name={i < rating ? 'star' : 'star-outline'}
          size={size}
          color={i < rating ? colors.accent.gold : colors.text.muted}
        />
      </Pressable>
    ))}
  </View>
);
export default StarRating;
