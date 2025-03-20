import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OtpScreen from "../screens/OtpScreen";
import BiometricScreen from "../screens/BiometricScreen";
import QRScanner from "../screens/QRScanner";
import BioCheckAuth from "../screens/BioCheckAuth";
import OtpCheckAuth from "../screens/OtpCheckAuth";
import CheckInAuth from "../screens/CheckInAuth";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpScreen} />
      <Stack.Screen name="BiometricScreen" component={BiometricScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
      <Stack.Screen name="BioCheckAuth" component={BioCheckAuth} />
      <Stack.Screen name="OtpCheckAuth" component={OtpCheckAuth} />
      <Stack.Screen name="CheckInAuth" component={CheckInAuth} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
