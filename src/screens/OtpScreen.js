import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const OtpScreen = ({ navigation, route }) => {
  const { email, from } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialOtp, setInitialOtp] = useState(false);
  const [resending, setResending] = useState(false);
  const appState = useRef(AppState.currentState);
  const isResuming = useRef(false);

  const sendVerifyOtp = async (email) => {
    const response = await fetch("https://8vsanyv1b3.execute-api.ap-southeast-1.amazonaws.com/prod/sendVerifyOtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  };

  const sendDeviceVerifyOtp = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) throw new Error("No access token found.");

    const response = await fetch("https://nwndykuo0a.execute-api.ap-southeast-1.amazonaws.com/prod/deviceSendVerifyOtp", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  };

  const sendOtp = async () => {
    setResending(true);
    try {
      const isDeviceFlow = from === "AddDevice";
      const result = isDeviceFlow ? await sendDeviceVerifyOtp() : await sendVerifyOtp(email);
      Alert.alert("OTP Sent", result.message);
    } catch (error) {
      console.error("Error sending OTP:", error);
      const message = error.message?.includes("Internal server error")
        ? "Unable to send OTP. Please try again later."
        : error.message || "Failed to send OTP.";
      Alert.alert("Error", message);
    }
    setResending(false);
  };

  const verifyOtp = async (email, otp) => {
    const response = await fetch("https://2dj1t5cuhd.execute-api.ap-southeast-1.amazonaws.com/prod/verifyOtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  };

  const verifyDeviceOtp = async (otp) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) throw new Error("No access token found.");

    const response = await fetch("https://pok91tugyk.execute-api.ap-southeast-1.amazonaws.com/prod/verifyOtpDevice", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const isDeviceFlow = from === "AddDevice";
      const response = isDeviceFlow
        ? await verifyDeviceOtp(otp)
        : await verifyOtp(email, otp);

      if (response.message?.includes("verified successfully")) {
        Alert.alert("Success", "OTP Verified Successfully!");
        navigation.replace(isDeviceFlow ? "BiometricScreen" : "PasswordChange", { email });
      } else {
        Alert.alert("OTP Verification Failed", response.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigation.replace(from === "AddDevice" ? "Devices" : "Login");
  };

  useEffect(() => {
    if (from === "AddDevice" && !initialOtp) {
      sendOtp();
      setInitialOtp(true);
    }

    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App resumed, resending OTP...");
        if (from === "AddDevice" && !resending && !isResuming.current) {
          isResuming.current = true;
          sendOtp().finally(() => {
            isResuming.current = false;
          });
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [initialOtp]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#1c1c1d" />
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to:
        {"\n"}
        <Text style={styles.email}>{email}</Text>
      </Text>

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
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
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
    marginBottom: 10,
    textAlign: "center",
    color: "#1c1c1d",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  email: {
    fontWeight: "600",
    color: "#1c1c1d",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 18,
  },
  button: {
    width: "100%",
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
  resendButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  resendText: {
    color: "#007bff",
    fontSize: 16,
  },
});
