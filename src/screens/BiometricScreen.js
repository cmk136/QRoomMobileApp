import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BiometricScreen = ({ navigation }) => {
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("accessToken");
            console.log("🔹 Token in BiometricScreen:", token);
        };
        
        checkToken();
        authenticateWithBiometrics();
    }, []);
      

  const authenticateWithBiometrics = async () => {
    try {
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

        // ✅ Retrieve and log the access token
        const accessToken = await AsyncStorage.getItem("accessToken");
        console.log("✅ Access Token:", accessToken); // Logs the token to console for testing

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
