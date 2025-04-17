import React, { useEffect, useState, useContext} from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { registerDevice, addUserDevice } from "../api/authService";
import { AppContext } from "../context/AppContext";

const BiometricScreen = ({ navigation, route }) => {
  const { fetchWithAuth } = useContext(AppContext);
  const [deviceId, setDeviceId] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const email = route?.params?.email || null;
  const isDeviceFlow = route?.params?.from === "AddDevice";

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        if (!Device.isDevice) {
          console.warn("Device module is only available on physical devices!");
          return;
        }

        const id = Device.osBuildId || Device.deviceName || "UnknownDevice";
        const name = Device.deviceName || "Unknown Device";

        setDeviceId(id);
        setDeviceName(name);

        await AsyncStorage.setItem("registeredDeviceId", id);

        console.log("Registered Device ID:", id);
        console.log("Device Name:", name);
      } catch (error) {
        console.error("Error fetching device details:", error);
      }
    };

    fetchDeviceDetails();
  }, []);

  const authenticateWithBiometrics = async () => {
    try {
      if (!email && !isDeviceFlow) {
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
        promptMessage: "Authenticate to proceed",
        fallbackLabel: "Use passcode instead",
        cancelLabel: "Cancel",
      });
  
      if (result.success) {
        Alert.alert("Success", "Biometric Authentication Enabled!");
  
        console.log("Email:", email);
        console.log("Device ID:", deviceId);
        console.log("Device Name:", deviceName);
  
        if (deviceId && deviceName) {
          try {
            // 🔍 Fetch existing devices
            const response = await fetchWithAuth("https://07e2pbmve3.execute-api.ap-southeast-1.amazonaws.com/prod/fetchDevices");
            const data = await response.json();
            const existingDevices = data.devices || [];
  
            console.log("Fetched Devices from Server:", existingDevices);
            console.log("Checking for existing deviceId:", deviceId);
  
            const isDuplicate = existingDevices.some((device) => {
              const match = String(device.deviceId).trim() === String(deviceId).trim();
              console.log(`Compare: '${device.deviceId}' === '${deviceId}' => ${match}`);
              return match;
            });
  
            if (isDuplicate) {
              Alert.alert("Device Already Registered", "This device is already registered to your account.");
              return;
            }
  
            let registerResponse;
  
            if (isDeviceFlow) {
              registerResponse = await addUserDevice(deviceId, deviceName);
            } else {
              registerResponse = await registerDevice(email, deviceId, deviceName);
            }
  
            console.log("Device Registered Successfully:", registerResponse);
          } catch (error) {
            console.error("Device Registration Error:", error);
            Alert.alert("Error", error.message || "Failed to register device.");
          }
        } else {
          console.warn("Device details not available yet.");
        }
  
        navigation.replace("Dashboard");
      } else {
        Alert.alert("Biometric Authentication Failed", "Please try again.");
      }
    } catch (error) {
      console.error("Biometric Authentication Error:", error);
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
