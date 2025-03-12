import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { sendVerifyOtp, verifyOtp, storeDeviceId  } from "../api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const OtpScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialOtp, setInitialOtp] = useState(false);
  const [resending, setResending] = useState(false);

  const sendOtp = async() => {
    setResending(true);

    try{
      const response = await sendVerifyOtp(email);
      Alert.alert("OTP Sent", response.message);

    } catch(error){
      Alert.alert("OTP Sent", error.message);
    }
    setResending(false);
  };

  useEffect(() => {
    if (!initialOtp) {
      sendOtp();
      setInitialOtp(true);
    }
  }, [initialOtp]);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email, otp);

      if (response.success) {
        authenticateBiometrics();
      } else {
        Alert.alert("OTP Verification Failed", response.message || "Invalid OTP.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
    }
    setLoading(false);
  };

  const authenticateBiometrics = async () => {
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with Face ID / Fingerprint",
      cancelLabel: "Cancel",
    });

    if (biometricAuth.success) {

      try {
        const response = await storeDeviceId(email, deviceId);

        if (response.accessToken && response.refreshToken) {
          await AsyncStorage.setItem("accessToken", response.accessToken);
          await AsyncStorage.setItem("refreshToken", response.refreshToken);
          navigation.replace("Home");
        } else {
          Alert.alert("Error", response.message);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to store device ID.");
      }
    } else {
      Alert.alert("Biometric Authentication Failed", "Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>An OTP has been sent to {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton} onPress={sendOtp} disabled={resending}>
        {resending ? <ActivityIndicator color="#007bff" /> : <Text style={styles.resendText}>Resend OTP</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: { width: "100%", height: 50, backgroundColor: "white", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#ccc", textAlign: "center", fontSize: 18 },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", borderRadius: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  resendButton: { marginTop: 10 },
  resendText: { color: "#007bff", fontSize: 16 },
});

