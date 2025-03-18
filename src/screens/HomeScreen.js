import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserBookings } from "../api/authService";
import { ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; 
import { Camera } from "expo-camera";

const HomeScreen = ({ navigation }) => {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    fetchBookings();
    requestCameraPermission();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        ),
      });
    }, [])
  );

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookings = await fetchUserBookings();
      console.log("Fetched Bookings:", bookings);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= today;
      });

      setBooking(upcomingBookings || []);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch bookings.");
    }
    setLoading(false);
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const openQRScanner = () => {
    if (hasPermission === false) {
      Alert.alert("Error", "Camera permission is required to scan QR codes.");
      return;
    }
    navigation.navigate("QRScanner"); //
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleScanQRCode = () => {
    navigation.navigate("QRScannerScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : booking.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.subtitle}>Your Upcoming Bookings:</Text>
          {booking.map((booking, index) => (
            <View key={index} style={styles.bookingCard}>
              <Text style={styles.bookingText}>
                {`${booking.roomName} (${booking.location})`}
              </Text>
              <Text style={styles.bookingText}>
                {new Date(booking.bookingDate).toDateString()}
              </Text>
              <Text style={styles.bookingText}>{`Timeslot: ${booking.timeslot}`}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noBookingText}>
          You have no upcoming bookings. Book a room on the website!
        </Text>
      )}

      <View style={styles.qrButtonContainer}>
        <TouchableOpacity style={styles.qrButton} onPress={handleScanQRCode}>
          <Text style={styles.qrButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  bookingCard: { width: "100%", backgroundColor: "white", padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: "#ccc" },
  bookingText: { fontSize: 16 },
  noBookingText: { fontSize: 16, color: "#777", textAlign: "center", marginTop: 20 },
  scrollView: { width: "100%", marginBottom: 20 },

  qrButtonContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  qrButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  qrButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    marginRight: 15,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 50,
  },
});
