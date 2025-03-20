import React, { useEffect, useState, useContext} from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";

export default function OTPCheckIn() {
  const navigation = useNavigation();
  const route = useRoute();
  const receivedOtp = route.params?.otp || null;
  const receivedBookingId = route.params?.bookingId || null;

  const [otp, setOtp] = useState(receivedOtp); //Future Implementation to dynamically update OTP after timer expires.
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [loading, setLoading] = useState(!receivedOtp);
  const { fetchWithAuth } = useContext(AppContext);


  
  const checkUnlockStatus = async () => {
    let isUnlocked = false;
    
    while (!isUnlocked) {
      try {
        const response = await fetchWithAuth("https://dx3ki16cm6.execute-api.ap-southeast-1.amazonaws.com/prod/checkUnlock", {
          method: "POST",
          body: JSON.stringify({ bookingId : receivedBookingId }),
        });
  
        const data = await response.json();
        console.log(data);
        if (data.success && data.isUnlocked) {
          isUnlocked = true;
          console.log("Room unlocked!");
          // Navigate to success screen
          navigation.replace("CheckInAuth");
        }
      } catch (error) {
        console.error("Error checking unlock:", error);
      }

      // Wait for 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
};

  useEffect(() => {
    checkUnlockStatus();
    if (receivedOtp) {
      setLoading(false);
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          // When time runs out, alert user & send them back
          Alert.alert(
            "OTP Expired",
            "Your OTP has expired. Please restart the check-in process.",
            [{ text: "OK", onPress: () => navigation.replace("Home") }]
          );
          clearInterval(timer);
        }
        return prevTime > 0 ? prevTime - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the OTP below on the Door System to unlock the room.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <View style={styles.otpContainer}>
            <Text style={styles.otpText}>{otp}</Text>
          </View>
          <Text style={styles.expiryText}>Your OTP will expire in: {formatTime()}</Text>
        </>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.replace("Home")}>
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
  otpContainer: {
    backgroundColor: "black",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  otpText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  expiryText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
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
