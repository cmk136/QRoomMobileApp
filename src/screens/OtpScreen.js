import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { sendVerifyOtp, verifyOtp  } from "../api/authService";

const OtpScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialOtp, setInitialOtp] = useState(false);
  const [resending, setResending] = useState(false);

  // sendOtp
  const sendOtp = async() => {
    setResending(true);

    try{
      const response = await sendVerifyOtp(email);
      Alert.alert("OTP Sent", response.message);

    } catch(error){
      Alert.alert("Error sending OTP", error.message);
    }
    setResending(false);
  };

  useEffect(() => {
    if (!initialOtp) {
      sendOtp();
      setInitialOtp(true);
    }
  }, [initialOtp]);

  // handleVerifyOtp
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await verifyOtp(email, otp);
  
      console.log("Full OTP Verification Response:", response);
  
      if (response.message && response.message.includes("verified successfully")) {
        Alert.alert("Success", "OTP Verified Successfully!");
  
        // Debugging log before navigating
        console.log("Navigating to BiometricScreen with email:", email);
  
        navigation.replace("PasswordChange", { email });
      } else {
        Alert.alert("OTP Verification Failed", response.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
    setLoading(false);
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

