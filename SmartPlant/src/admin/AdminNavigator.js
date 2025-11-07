import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from './screens/DashboardScreen';
import AccountManagementScreen from './screens/AccountManagementScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import AddUserScreen from './screens/AddUserScreen';
import MailManagementScreen from './screens/MailManagementScreen';
import MailDetailScreen from './screens/MailDetailScreen';
import FeedbackManagementScreen from './screens/FeedbackManagementScreen';
import FeedbackDetailScreen from './screens/FeedbackDetailScreen';

import EditUserScreen from './screens/EditUserScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AccountManagement" component={AccountManagementScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="MailManagement" component={MailManagementScreen} />
      <Stack.Screen name="MailDetail" component={MailDetailScreen} />
      <Stack.Screen name="FeedbackManagement" component={FeedbackManagementScreen} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
    </Stack.Navigator>
    </SafeAreaView>
  );
}