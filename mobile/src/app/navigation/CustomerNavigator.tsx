import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

import HomeScreen from '../../screens/home/HomeScreen';
import ServicesScreen from '../../screens/services/ServicesScreen';
import ServiceDetailScreen from '../../screens/services/ServiceDetailScreen';
import BookingStep1Screen from '../../screens/booking/BookingStep1Screen';
import BookingStep2Screen from '../../screens/booking/BookingStep2Screen';
import BookingStep3Screen from '../../screens/booking/BookingStep3Screen';
import BookingStep4Screen from '../../screens/booking/BookingStep4Screen';
import BookingConfirmScreen from '../../screens/booking/BookingConfirmScreen';
import BookingsListScreen from '../../screens/booking/BookingsListScreen';
import BookingDetailScreen from '../../screens/booking/BookingDetailScreen';
import GarageScreen from '../../screens/garage/GarageScreen';
import AddVehicleScreen from '../../screens/garage/AddVehicleScreen';
import GalleryScreen from '../../screens/gallery/GalleryScreen';
import MembershipScreen from '../../screens/membership/MembershipScreen';
import LoyaltyScreen from '../../screens/membership/LoyaltyScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import ReviewScreen from '../../screens/reviews/ReviewScreen';

export type CustomerTabParamList = {
  HomeTab: undefined;
  ServicesTab: undefined;
  BookingsTab: undefined;
  GarageTab: undefined;
  ProfileTab: undefined;
};

export type CustomerStackParamList = {
  Tabs: undefined;
  ServiceDetail: { serviceId: number };
  BookingStep1: { serviceId: number };
  BookingStep2: undefined;
  BookingStep3: undefined;
  BookingStep4: undefined;
  BookingConfirm: { bookingId: number };
  BookingDetail: { bookingId: number };
  AddVehicle: { vehicleId?: number };
  Gallery: undefined;
  Membership: undefined;
  Loyalty: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Review: { bookingId: number };
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function TabBar() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: tabBarHeight, paddingBottom: insets.bottom + 6 }],
        tabBarActiveTintColor: colors.accent.blue,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            HomeTab: ['home', 'home-outline'],
            ServicesTab: ['car-sport', 'car-sport-outline'],
            BookingsTab: ['calendar', 'calendar-outline'],
            GarageTab: ['car', 'car-outline'],
            ProfileTab: ['person', 'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ServicesTab" component={ServicesScreen} options={{ title: 'Services' }} />
      <Tab.Screen name="BookingsTab" component={BookingsListScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="GarageTab" component={GarageScreen} options={{ title: 'Garage' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabBar} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="BookingStep1" component={BookingStep1Screen} />
      <Stack.Screen name="BookingStep2" component={BookingStep2Screen} />
      <Stack.Screen name="BookingStep3" component={BookingStep3Screen} />
      <Stack.Screen name="BookingStep4" component={BookingStep4Screen} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
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
