import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../../screens/onboarding/SplashScreen';
import OnboardingScreen from '../../screens/onboarding/OnboardingScreen';
import PhoneLoginScreen from '../../screens/auth/PhoneLoginScreen';
import OtpVerifyScreen from '../../screens/auth/OtpVerifyScreen';
import ProfileSetupScreen from '../../screens/auth/ProfileSetupScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PhoneLogin: undefined;
  OtpVerify: { phone: string };
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
