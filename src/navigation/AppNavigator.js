import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OtpScreen from "../screens/OtpScreen";
import BiometricScreen from "../screens/BiometricScreen";
import QRScannerScreen from "../screens/QRScannerScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpScreen} />
      <Stack.Screen name="BiometricScreen" component={BiometricScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
