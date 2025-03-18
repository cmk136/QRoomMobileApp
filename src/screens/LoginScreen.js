import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { loginUser } from "../api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email, password);
      console.log("🔹 Full Login Response:", response);
      if (response.requiresVerification) {
        // Redirect to OTP verification screen without showing an alert
        console.log("Redirecting to OTP Verification...");
        navigation.replace("OtpVerification", { email });
        return;
      }

      if (response.accessToken) {
        console.log("✅ Received Access Token:", response.accessToken);
        // Store tokens in AsyncStorage
        await AsyncStorage.setItem("accessToken", response.accessToken);
        console.log(response.accessToken); //retrieve user's access token
        await AsyncStorage.setItem("refreshToken", response.refreshToken);

        // ✅ Verify that the token was stored successfully
        const storedToken = await AsyncStorage.getItem("accessToken");
        console.log("🔹 Token Retrieved from AsyncStorage:", storedToken);

        // Navigate to Home Screen
        navigation.replace("Home");
      } else {
        Alert.alert("Login Failed", response.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Login Error", error.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QRoom Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", height: 50, backgroundColor: "white", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#ccc" },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", borderRadius: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
