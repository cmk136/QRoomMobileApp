// src/navigation/AppNavigator.js

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import PasswordChange from "../screens/PasswordChange";
import BiometricScreen from "../screens/BiometricScreen";
import BioCheckAuth from "../screens/BioCheckAuth";
import OtpCheckAuth from "../screens/OtpCheckAuth";
import CheckInAuth from "../screens/CheckInAuth";

import DashboardTabs from "./DashboardTabs";
import QRScanner from "../screens/QRScanner";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpScreen} />
      <Stack.Screen name="PasswordChange" component={PasswordChange} />
      <Stack.Screen name="BiometricScreen" component={BiometricScreen} />
      <Stack.Screen name="BioCheckAuth" component={BioCheckAuth} />
      <Stack.Screen name="OtpCheckAuth" component={OtpCheckAuth} />
      <Stack.Screen name="CheckInAuth" component={CheckInAuth} />

      {/* Main tabs */}
      <Stack.Screen name="Dashboard" component={DashboardTabs} />

      {/* QR Scanner screen */}
      <Stack.Screen name="QRScanner" component={QRScanner} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
