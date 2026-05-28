import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  totalSteps,
  labels,
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1;
      const isActive = step === currentStep;
      const isDone = step < currentStep;
      return (
        <React.Fragment key={step}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDone || isActive ? colors.accent.blue : colors.bg.surface,
                borderWidth: 1,
                borderColor: isActive ? colors.accent.blue : colors.border.default,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: isDone || isActive ? colors.text.inverse : colors.text.muted,
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                {isDone ? '✓' : step}
              </Text>
            </View>
            {labels?.[i] && (
              <Text
                style={{
                  color: isActive ? colors.text.primary : colors.text.muted,
                  fontSize: 10,
                  marginTop: 4,
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {labels[i]}
              </Text>
            )}
          </View>
          {step < totalSteps && (
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor:
                  step < currentStep ? colors.accent.blue : colors.border.default,
                marginBottom: labels ? 16 : 0,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </View>
);
export default ProgressStepper;
