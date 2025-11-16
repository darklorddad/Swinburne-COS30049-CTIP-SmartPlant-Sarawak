import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import IdentifyPage from './src/pages/identify';
import IdentifyTips from './src/pages/identify_tips';
import IdentifyOutput from './src/pages/identify_output';
import Identify from './src/pages/identify';
import Profile from "./src/pages/Profile";
import MyProfile from "./src/pages/Myprofile";
import EditProfile from "./src/pages/EditProfile";
import MyPost from "./src/pages/MyPost";
import Setting from "./src/pages/Setting";
import Saved from "./src/pages/Saved";
import NotificationUser from "./src/pages/NotificationUser";
import NotificationExpert from "./src/pages/NotificationExpert";
import MapPage from "./src/pages/MapPage";

import Introduction from "./src/pages/Introduction";
import UserLogin from "./src/pages/UserLogin";
import UserRegister from "./src/pages/UserRegister";
import LoginSelection from "./src/pages/LoginSelection";
import ForgetPassword from "./src/pages/ForgetPassword";

import HomepageExpert from "./src/pages/HomepageExpert";
import HomepageUser from "./src/pages/HomepageUser";
import PlantDetailUser from "./src/pages/PlantDetailUser";
import PlantManagementDetail from "./src/pages/PlantManagementDetail";
import PlantManagementList from "./src/pages/PlantManagementList";
import PostDetail from "./src/pages/PostDetail";
import ReportError from "./src/pages/ReportError";
import TopSuggestions from "./src/pages/TopSuggestions";
import AdminNavigator from './src/admin/AdminNavigator';

import { AdminProvider } from './src/admin/AdminContext';
import { PermissionProvider } from "./src/components/PermissionManager";

import AIChatScreen from "./src/pages/AIChatScreen"
import PlantDetailScreen from "./src/screens/PlantDetailScreen";
import UserFeedbackDetail from "./src/pages/UserFeedbackDetail";

import AlertHistory from "./src/admin/screens/AlertHistory";

//testing the component
import Tabs from './tabs/Tabs';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
    <AdminProvider>
    <PermissionProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="back" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Back" component={Tabs}/>
          <Stack.Screen name="Profile" component={Profile} />
          {/* <Stack.Screen name="IoTDashboard" component={IoTDashboard} /> */}
          {/* <Stack.Screen name="DashboardScreen" component={DashboardScreen} /> */}
          <Stack.Screen name="MyProfile" component={MyProfile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="MyPost" component={MyPost} />

          <Stack.Screen name="MapPage" component={MapPage} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="Saved" component={Saved} />
          <Stack.Screen name="NotificationUser" component={NotificationUser} />
          <Stack.Screen name="NotificationExpert" component={NotificationExpert} />
          <Stack.Screen name="IdentifyPage" component={IdentifyPage} />
          <Stack.Screen name="IdentifyTips" component={IdentifyTips} />
          <Stack.Screen name="IdentifyOutput" component={IdentifyOutput}/>
          <Stack.Screen name="Identify" component={Identify}/>

          <Stack.Screen name="Introduction" component={Introduction} />
          <Stack.Screen name="UserLogin" component={UserLogin} />
          <Stack.Screen name="UserRegister" component={UserRegister} />
          <Stack.Screen name="LoginSelection" component={LoginSelection} />
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />

          <Stack.Screen name="HomepageExpert" component={HomepageExpert}/>
          <Stack.Screen name="HomepageUser" component={HomepageUser}/>
          <Stack.Screen name="PlantDetailUser" component={PlantDetailUser}/>
          <Stack.Screen name="PlantManagementDetail" component={PlantManagementDetail}/>
          <Stack.Screen name="PlantManagementList" component={PlantManagementList}/>
          <Stack.Screen name="PostDetail" component={PostDetail}/>
          <Stack.Screen name="ReportError" component={ReportError}/>
          <Stack.Screen name="TopSuggestions" component={TopSuggestions}/>
          <Stack.Screen name="back" component={AdminNavigator} />
          <Stack.Screen name="AIChatScreen" component={AIChatScreen} />
          <Stack.Screen name="PlantDetailScreen" component={PlantDetailScreen} options={{ headerShown: true, headerTitle: "Plant", headerBackTitleVisible: false, }} />
          <Stack.Screen name="UserFeedbackDetail" component={UserFeedbackDetail} />
          <Stack.Screen name="AlertHistory" component={AlertHistory} options={{ headerShown: true, headerTitle: "Alert History", headerBackTitleVisible: true, }} />

        </Stack.Navigator>
      </NavigationContainer>
    </PermissionProvider>
    </AdminProvider>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});