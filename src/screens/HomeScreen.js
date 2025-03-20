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
            <Text style={styles.logoutText}>Logout</Text>
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
    navigation.replace("QRScanner");
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
        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("QRScanner")}>
          <Text style={styles.buttonText}>Check-In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  bookingCard: {
    width: "100%",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingText: {
    fontSize: 16,
    color: "#333",
  },
  noBookingText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
  qrButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center", 
  },
  button: {
    width: "75%", 
    maxWidth: 280, 
    backgroundColor: "#007bff", 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600", 
    letterSpacing: 0.5, 
  },
  
  logoutButton: {
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#000", 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 30, 
    marginRight: 15,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5, 
  },
});
