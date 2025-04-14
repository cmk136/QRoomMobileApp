import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
      if (response.requiresVerification) {
        navigation.replace("OtpVerification", { email });
        return;
      }

      if (response.accessToken) {
        await AsyncStorage.setItem("accessToken", response.accessToken);
        await AsyncStorage.setItem("refreshToken", response.refreshToken);
        navigation.replace("Dashboard");
      } else {
        Alert.alert("Login Failed", response.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Login Error", error.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>QRoom Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#28282a"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#28282a"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1c1c1d",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#f5f5f3",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#1c1c1d",
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#1c1c1d",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
