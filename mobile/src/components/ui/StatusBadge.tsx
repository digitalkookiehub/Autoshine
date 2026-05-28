import React from 'react';
import { View, Text } from 'react-native';
import type { BookingStatus } from '../../types';
import { colors } from '../../theme/colors';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: colors.status.warning, bg: colors.status.warningDim },
  confirmed: { label: 'Confirmed', color: colors.status.info, bg: colors.accent.glow },
  in_progress: { label: 'In Progress', color: '#7C4DFF', bg: 'rgba(124,77,255,0.15)' },
  completed: { label: 'Completed', color: colors.status.success, bg: colors.status.successDim },
  cancelled: { label: 'Cancelled', color: colors.status.error, bg: colors.status.errorDim },
};

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status];
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  const paddingH = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const paddingV = size === 'sm' ? 3 : size === 'lg' ? 7 : 5;

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderRadius: 20,
        paddingHorizontal: paddingH,
        paddingVertical: paddingV,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: config.color, fontSize, fontWeight: '600', letterSpacing: 0.3 }}>
        {config.label}
      </Text>
    </View>
  );
};

export { StatusBadge };
export default StatusBadge;
