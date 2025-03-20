import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Device from "expo-device";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";

export default function BioCheckAuth() {
  const { fetchWithAuth } = useContext(AppContext);
  const navigation = useNavigation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Verify User's Device & Fetch OTP
  const verifyUserDevice = async () => {
    if (isAuthenticating) return; // Prevent multiple clicks
    setIsAuthenticating(true);

    try {
      const deviceId = Device.osBuildId; // Get device ID
      console.log("Verifying Device ID:", deviceId);

      const response = await fetchWithAuth(
        "https://tk03adtmuc.execute-api.ap-southeast-1.amazonaws.com/prod/verifyDeviceId",
        {
          method: "POST",
          body: JSON.stringify({ bookingDeviceId : deviceId }),
        }
      );

      const data = await response.json();
      console.log("🔹 Server Response:", data);

      if (data.success) {
        Alert.alert("Verification Successful", "Device verified successfully.");
        navigation.replace("OtpCheckAuth", { otp: data.otp , bookingId: data.bookingId});
      } else {
        Alert.alert("Verification Failed", data.message || "Invalid device.");
      }
    } catch (error) {
      console.error("Device verification failed:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Biometric Authentication before verifying the device
  const handleBiometricAuth = async () => {
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
    });

    if (biometricAuth.success) {
      verifyUserDevice(); // Call the function to verify device ID & get OTP after biometric success
    } else {
      Alert.alert("Authentication Failed", "Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric Authentication</Text>
      <Text style={styles.message}>
        Please authenticate your identity using biometrics. This ensures that your identity matches the room booking.
      </Text>

      <TouchableOpacity
        style={[styles.authButton, isAuthenticating && styles.disabledButton]}
        onPress={handleBiometricAuth}
        disabled={isAuthenticating}
      >
        <Text style={styles.authButtonText}>
          {isAuthenticating ? "Verifying..." : "Verify Biometrics"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  authButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#b0b0b0",
  },
});
