import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../context/AppContext";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BioCheckAuth() {
  const { fetchWithAuth } = useContext(AppContext);
  const navigation = useNavigation();
  const route = useRoute();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [storedDeviceId, setStoredDeviceId] = useState(null);

  const level = route?.params?.level || null;
  const bookingId = route?.params?.bookingId || null;

  useEffect(() => {
    const getStoredDeviceId = async () => {
      const deviceId = await AsyncStorage.getItem("registeredDeviceId");
      setStoredDeviceId(deviceId);
      console.log("Stored Device ID for Verification:", deviceId);
    };

    getStoredDeviceId();
  }, []);

  const unlockRoom = async () => {
    try {
      const response = await fetchWithAuth(
        "https://c66lw5x49g.execute-api.ap-southeast-1.amazonaws.com/prod/setIsUnlocked", 
        {
          method: "POST",
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();
      console.log("Unlock Room Response:", data);

      if (data.success) {
        Alert.alert("Room Unlocked", "Access granted.");
        navigation.replace("CheckInAuth", { level, bookingId });
      } else {
        Alert.alert("Unlock Failed", data.message || "Unable to unlock room.");
      }
    } catch (error) {
      console.error("Unlock error:", error);
      Alert.alert("Error", "An error occurred while unlocking the room.");
    }
  };

  const sendBookingOTP = async () => {
    try {
      const response = await fetchWithAuth(
        "https://yyx5yuebgi.execute-api.ap-southeast-1.amazonaws.com/prod/sendBookingOtp", 
        {
          method: "POST",
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();
      console.log("Unlock Room Response:", data);

      if (data.success) {
        navigation.replace("OtpCheckAuth", { bookingId, level });
      } else {
        Alert.alert("OTP could not be sent.");
      }
    } catch (error) {
      console.error("Unlock error:", error);
      Alert.alert("Error", "An error occurred while unlocking the room.");
    }
  };

  const verifyUserDevice = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);

    try {
      if (!storedDeviceId) {
        Alert.alert("Error", "Device ID not found. Please try registering again.");
        return;
      }

      console.log("Verifying Device ID:", storedDeviceId);

      const response = await fetchWithAuth(
        "https://tk03adtmuc.execute-api.ap-southeast-1.amazonaws.com/prod/verifyDeviceId",
        {
          method: "POST",
          body: JSON.stringify({ bookingDeviceId: storedDeviceId }),
        }
      );

      const data = await response.json();
      console.log("Server Response:", data);

      if (data.success) {
        Alert.alert("Verification Successful", "Device verified successfully.");

        if (level === 2 && bookingId) {
          await unlockRoom();
        } if (level === 3 && bookingId) {
          await sendBookingOTP();
        } else {
          Alert.alert("Invalid Security Level.")
        }        
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

  const handleBiometricAuth = async () => {
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
    });

    if (biometricAuth.success) {
      verifyUserDevice();
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
