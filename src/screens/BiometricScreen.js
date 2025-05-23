import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { AppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const BiometricScreen = ({ navigation, route }) => {
  const { fetchWithAuth } = useContext(AppContext);
  const [deviceId, setDeviceId] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const email = route?.params?.email || null;
  const from = route?.params?.from || null;
  const isDeviceFlow = from === "AddDevice";
  const isSetupFlow = from === "AccountSetup";

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

  const handleBack = () => {
    if (isDeviceFlow) {
      navigation.replace("Devices");
    } else {
      navigation.replace("Login");
    }
  };

  const fetchUserDevices = async () => {
    try {
      const response = await fetchWithAuth(
        "https://07e2pbmve3.execute-api.ap-southeast-1.amazonaws.com/prod/fetchDevices"
      );
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error("Device Registration Error:", error);
      if (Platform.OS !== "web") {
        Alert.alert("Error", "Failed to fetch registered devices.");
      }
      return [];
    }
  };

  const registerDevice = async (email, deviceId, deviceName) => {
    try {
      const response = await fetch(
        "https://43eextcx60.execute-api.ap-southeast-1.amazonaws.com/prod/registerDevice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, deviceId, deviceName }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Device registration failed.");
      return data;
    } catch (error) {
      throw error;
    }
  };

  const addUserDevice = async (deviceId, deviceName) => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) throw new Error("No access token found.");

      const response = await fetch(
        "https://h5pu37tklb.execute-api.ap-southeast-1.amazonaws.com/prod/addDevice",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deviceId, deviceName }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to add device.");
      return result;
    } catch (error) {
      throw error;
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      if (!email && !isDeviceFlow && !isSetupFlow) {
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

      if (!result.success) {
        Alert.alert("Biometric Authentication Failed", "Please try again.");
        return;
      }

      Alert.alert("Success", "Biometric Authentication Enabled!");

      if (deviceId && deviceName) {
        let devices = [];

        if (isDeviceFlow) {
          devices = await fetchUserDevices();
        }

        const isDuplicate = devices.some(
          (device) =>
            String(device.deviceId).trim() === String(deviceId).trim()
        );

        if (isDuplicate) {
          Alert.alert("Device Already Registered", "This device is already registered.");
          return;
        }

        try {
          if (isDeviceFlow) {
            await addUserDevice(deviceId, deviceName);
          } else {
            await registerDevice(email, deviceId, deviceName);
          }
          console.log("Device registered successfully.");
        } catch (error) {
          console.error("Device Registration Error:", error);
          Alert.alert("Error", error.message || "Failed to register device.");
          return;
        }
      }

      Alert.alert("Account Validated", "Please log in to continue.", [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (error) {
      console.error("Biometric Authentication Error:", error);
      Alert.alert("Error", "An error occurred during authentication.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#1c1c1d" />
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>

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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "#1c1c1d",
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1c1c1d",
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