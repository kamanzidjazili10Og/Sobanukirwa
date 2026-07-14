import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminArtistsScreen from '../screens/admin/AdminArtistsScreen';
import AdminTracksScreen from '../screens/admin/AdminTracksScreen';
import AdminVideosScreen from '../screens/admin/AdminVideosScreen';
import AdminAdhkarScreen from '../screens/admin/AdminAdhkarScreen';
import AdminQuranScreen from '../screens/admin/AdminQuranScreen';
import AdminBooksScreen from '../screens/admin/AdminBooksScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a1220' } }}>
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminArtists" component={AdminArtistsScreen} />
      <Stack.Screen name="AdminTracks" component={AdminTracksScreen} />
      <Stack.Screen name="AdminVideos" component={AdminVideosScreen} />
      <Stack.Screen name="AdminAdhkar" component={AdminAdhkarScreen} />
      <Stack.Screen name="AdminQuran" component={AdminQuranScreen} />
      <Stack.Screen name="AdminBooks" component={AdminBooksScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
    </Stack.Navigator>
  );
}
