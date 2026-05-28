import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useStudioStore } from '../../store/studioStore';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from './AdminNavigator';

const theme = {
  dark: true,
  colors: {
    primary: '#00D4FF',
    background: '#0A0A0A',
    card: '#141414',
    text: '#FFFFFF',
    border: '#2A2A2A',
    notification: '#00D4FF',
  },
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const loadStudio = useStudioStore((s) => s.load);

  useEffect(() => { loadStudio(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <NavigationContainer theme={theme}>
      {!isAuthenticated ? <AuthNavigator /> : isAdmin ? <AdminNavigator /> : <CustomerNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
