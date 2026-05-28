import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { api } from '../../services/api';
import { CustomerStackParamList } from '../../app/navigation/CustomerNavigator';
import StarRating from '../../components/ui/StarRating';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'Review'>;

export default function ReviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('reviews', {
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How was your experience?</Text>
          <StarRating rating={rating} size={48} interactive onRate={setRating} />
          <Text style={styles.ratingText}>{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Your review (optional)</Text>
          <TextInput
            style={styles.textArea}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="star" size={18} color={colors.bg.primary} />
          <Text style={styles.submitBtnText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 28 },
  ratingSection: { alignItems: 'center', gap: 16 },
  ratingLabel: { fontSize: typography.sizes.h3, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  ratingText: { fontSize: 16, color: colors.accent.gold, fontWeight: '600' },
  field: { gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  textArea: {
    backgroundColor: colors.bg.surface, borderRadius: 14, borderWidth: 1,
    borderColor: colors.border.default, paddingHorizontal: 16, paddingVertical: 14,
    color: colors.text.primary, fontSize: 15, minHeight: 120,
  },
  submitBtn: {
    backgroundColor: colors.accent.blue, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitBtnText: { color: colors.bg.primary, fontSize: 16, fontWeight: '700' },
});
