import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { BackIcon } from '../src/admin/Icons';
import DashboardScreen from "../src/screens/DashboardScreen";
import MapScreen from "../src/screens/MapScreen";
import HistoryScreen from "../src/screens/HistoryScreen";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 16 }}
          >
            <BackIcon color="#3C3633" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#2ecc71",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: true,
          headerTitle: "Dashboard", // top center title
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerTitle: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerTitle: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
