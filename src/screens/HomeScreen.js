import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserBookings } from "../api/authService";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { AppContext } from "../context/AppContext";

const HomeScreen = ({ navigation }) => {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);

  const {logoutUser} = useContext(AppContext);

  useEffect(() => {
    fetchBookings();
    requestCameraPermission();
  }, []);

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

  const handleLogout = async () => {
    logoutUser(navigation);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logout Button (Top Right) */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Hello!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : booking.length > 0 ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
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
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 20,
  },
  logoutContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1c1c1d", 
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28282a", 
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  bookingCard: {
    width: "100%",
    backgroundColor: "#ffffff", 
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingText: {
    fontSize: 16,
    color: "#1c1c1d", 
  },
  noBookingText: {
    fontSize: 16,
    color: "#28282a", 
    textAlign: "center",
    marginTop: 20,
  },
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1d", 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  logoutText: {
    color: "#ffffff", 
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
