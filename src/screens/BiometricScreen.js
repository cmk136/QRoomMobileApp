import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";  // ✅ Import expo-device
import { registerDevice } from "../api/authService"; // ✅ Import API function

const BiometricScreen = ({ navigation, route }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const email = route?.params?.email || null;

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        if (!Device.isDevice) {
          console.warn("⚠️ Device module is only available on physical devices!");
          return;
        }

        const id = Device.osInternalBuildId || Device.deviceName || "UnknownDevice";
        const name = Device.deviceName || "Unknown Device";

        setDeviceId(id);
        setDeviceName(name);

        console.log("🔹 Device ID:", id);
        console.log("🔹 Device Name:", name);
      } catch (error) {
        console.error("❌ Error fetching device details:", error);
      }
    };

    fetchDeviceDetails();

    const checkToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");

      if (email) {
        console.log("🔹 Email Passed to BiometricScreen:", email);
      } else {
        console.warn("⚠️ No email found in route params!");
      }

      console.log("🔹 Token in BiometricScreen:", token);
    };

    checkToken();
  }, []);

  const authenticateWithBiometrics = async () => {
    try {
      if (!email) {
        console.error("❌ Missing email parameter");
        Alert.alert("Error", "Email is missing. Cannot proceed.");
        return;
      }

      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
      if (!isBiometricAvailable) {
        Alert.alert("Error", "Biometric authentication is not available on this device.");
        return;
      }

      const biometricRecords = await LocalAuthentication.isEnrolledAsync();
      if (!biometricRecords) {
        Alert.alert("Error", "No biometric records found. Please set up Face ID or Fingerprint.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometrics",
        fallbackLabel: "Use passcode instead",
        cancelLabel: "Cancel",
      });

      console.log("🔹 Biometric Authentication Result:", result);

      if (result.success) {
        Alert.alert("Success", "Biometric Authentication Enabled!");
        await AsyncStorage.setItem("biometricsEnabled", "true");

        console.log("✅ Email:", email);
        console.log("✅ Device ID:", deviceId);
        console.log("✅ Device Name:", deviceName);

        // ✅ Register the device after successful biometrics
        if (deviceId && deviceName) {
          try {
            const response = await registerDevice(email, deviceId, deviceName);
            console.log("✅ Device Registered Successfully:", response);
          } catch (error) {
            console.error("❌ Device Registration Error:", error);
          }
        } else {
          console.warn("⚠️ Device details not available yet. Fetching again...");
          fetchDeviceDetails();
        }

        // Retrieve and log the access token
        const accessToken = await AsyncStorage.getItem("accessToken");
        console.log("✅ Access Token:", accessToken);

        navigation.replace("Home");
      } else {
        Alert.alert("Biometric Authentication Failed", "Please try again.");
      }
    } catch (error) {
      console.error("❌ Biometric Authentication Error:", error);
      Alert.alert("Error", "An error occurred during authentication.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Biometrics</Text>
      <TouchableOpacity style={styles.button} onPress={authenticateWithBiometrics}>
        <Text style={styles.buttonText}>Enable Biometrics</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BiometricScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { width: "80%", height: 50, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", borderRadius: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
