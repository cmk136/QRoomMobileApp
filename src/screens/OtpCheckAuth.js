import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  AppState,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";

export default function OTPCheckIn() {
  const navigation = useNavigation();
  const route = useRoute();
  const receivedBookingId = route.params?.bookingId || null;

  const { fetchWithAuth } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 10;
  const appState = useRef(AppState.currentState);
  const isChecking = useRef(false);

  const checkUnlockStatus = async () => {
    if (isChecking.current) {
      console.log("🔄 Already checking, skipping duplicate call.");
      return;
    }
    isChecking.current = true;
    console.log("🚀 Checking unlock status...");

    try {
      const response = await fetchWithAuth(
        "https://dx3ki16cm6.execute-api.ap-southeast-1.amazonaws.com/prod/checkUnlock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId: receivedBookingId }),
        }
      );

      const data = await response.json();
      console.log("✅ Unlock check response:", data);

      if (data.success && data.isUnlocked) {
        console.log("🔓 Room unlocked, navigating to CheckInAuth...");
        navigation.replace("CheckInAuth");
      } else {
        console.log("❌ Not unlocked yet, attempt:", attempts + 1);
        setAttempts((prev) => prev + 1);
      }
    } catch (error) {
      console.error("❌ Error checking unlock:", error);
      setAttempts((prev) => prev + 1);
    } finally {
      isChecking.current = false;
    }
  };

  useEffect(() => {
    if (!receivedBookingId) {
      Alert.alert("Missing Booking ID", "No booking ID found.");
      navigation.replace("Dashboard");
      return;
    }

    checkUnlockStatus();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("📲 App resumed — retrying unlock check after delay.");
        setTimeout(() => {
          isChecking.current = false;
          checkUnlockStatus();
        }, 2000);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (attempts > 0 && attempts < MAX_ATTEMPTS && !isChecking.current) {
      console.log("⏱ Retrying unlock check in 5s, attempt:", attempts);
      const delay = setTimeout(() => {
        checkUnlockStatus();
      }, 5000);
      return () => clearTimeout(delay);
    } else if (attempts >= MAX_ATTEMPTS) {
      console.log("🛑 Max attempts reached. Showing timeout alert.");
      Alert.alert("Timeout", "Unable to verify unlock. Please try again.");
      setLoading(false);
    }
  }, [attempts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Email for OTP.</Text>
      <Text style={styles.subtitle}>Key in OTP into the Kiosk Screen.</Text>

      {loading && (
        <View style={{ marginTop: 30 }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, fontStyle: "italic", color: "#555" }}>
            Waiting for unlock...
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.replace("Dashboard")}
      >
        <Text style={styles.cancelText}>Cancel</Text>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});