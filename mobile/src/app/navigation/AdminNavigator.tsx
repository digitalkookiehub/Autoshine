import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

import AdminDashboardScreen from '../../screens/admin/AdminDashboardScreen';
import AdminBookingsScreen from '../../screens/admin/AdminBookingsScreen';
import AdminBookingDetailScreen from '../../screens/admin/AdminBookingDetailScreen';
import AdminCustomersScreen from '../../screens/admin/AdminCustomersScreen';
import AdminCustomerDetailScreen from '../../screens/admin/AdminCustomerDetailScreen';
import AdminAnalyticsScreen from '../../screens/admin/AdminAnalyticsScreen';
import AdminSlotsScreen from '../../screens/admin/AdminSlotsScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import AdminOffersScreen from '../../screens/admin/AdminOffersScreen';
import AdminStudioScreen from '../../screens/admin/AdminStudioScreen';

export type AdminTabParamList = {
  DashboardTab: undefined;
  BookingsTab: undefined;
  CustomersTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

export type AdminStackParamList = {
  Tabs: undefined;
  AdminBookingDetail: { bookingId: number };
  AdminCustomerDetail: { customerId: number };
  AdminSlots: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  AdminOffers: undefined;
  AdminStudio: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabBar() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: tabBarHeight, paddingBottom: insets.bottom + 6 }],
        tabBarActiveTintColor: colors.accent.blue,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, [string, string]> = {
            DashboardTab: ['grid', 'grid-outline'],
            BookingsTab: ['calendar', 'calendar-outline'],
            CustomersTab: ['people', 'people-outline'],
            AnalyticsTab: ['bar-chart', 'bar-chart-outline'],
            ProfileTab: ['person', 'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="BookingsTab" component={AdminBookingsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="CustomersTab" component={AdminCustomersScreen} options={{ title: 'Customers' }} />
      <Tab.Screen name="AnalyticsTab" component={AdminAnalyticsScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AdminTabBar} />
      <Stack.Screen name="AdminBookingDetail" component={AdminBookingDetailScreen} />
      <Stack.Screen name="AdminCustomerDetail" component={AdminCustomerDetailScreen} />
      <Stack.Screen name="AdminSlots" component={AdminSlotsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AdminOffers" component={AdminOffersScreen} />
      <Stack.Screen name="AdminStudio" component={AdminStudioScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg.secondary,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
