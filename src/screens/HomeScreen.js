import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const HomeScreen = ({ navigation }) => {
  const { logoutUser } = useContext(AppContext);
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateList, setDateList] = useState([]);

  useEffect(() => {
    fetchBookings();
    requestCameraPermission();
    generateDateSlider();
  }, []);

  useEffect(() => {
    // if (selectedDate && allBookings.length > 0) {
    //   const filtered = allBookings
    //     .filter((b) => b.bookingDate.startsWith(selectedDate))
    //     .sort(
    //       (a, b) =>
    //         new Date(`1970-01-01T${a.timeslot}`) -
    //         new Date(`1970-01-01T${b.timeslot}`)
    //     );
    //   setFilteredBookings(filtered);
    // }
      if (selectedDate && allBookings.length > 0) {
      const now = new Date();

      const filtered = allBookings
        .filter((b) => {
          // Match selected date
          if (!b.bookingDate.startsWith(selectedDate)) return false;

          const bookingDateTime = new Date(`${b.bookingDate}T${b.timeslot}`);

          // If selectedDate is today, only show future bookings
          if (selectedDate === now.toISOString().split("T")[0]) {
            return bookingDateTime >= now;
          }

          // If selectedDate is in future, include all
          return true;
        })
        .sort(
          (a, b) =>
            new Date(`${a.bookingDate}T${a.timeslot}`) -
            new Date(`${b.bookingDate}T${b.timeslot}`)
        );

      setFilteredBookings(filtered);
    }
  }, [selectedDate, allBookings]);

  const generateDateSlider = () => {
    const today = new Date();
    const next7 = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const localDateStr = `${year}-${month}-${day}`;

      next7.push({
        label: date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }),
        value: localDateStr,
      });
    }

    setDateList(next7);
    setSelectedDate(next7[0].value);
  };


  const fetchBookings = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) throw new Error("No access token found. Please log in again.");

      const response = await axios.get(
        "https://velilo080f.execute-api.ap-southeast-1.amazonaws.com/prod/fetchUsersBooking",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setAllBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Fetch Bookings Error:", error);
      Alert.alert("Error", error.message || "Failed to fetch bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) throw new Error("No access token found");

      const response = await axios.delete(
        "https://mjzry50v6f.execute-api.ap-southeast-1.amazonaws.com/prod/deleteBooking", 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          data: { bookingId }, 
        }
      );

      if (response.status === 200) {
        Alert.alert("Deleted", "Booking deleted successfully.");
        fetchBookings(); 
      } else {
        throw new Error("Booking deletion failed.");
      }
    } catch (error) {
      console.error("Delete Booking Error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to delete booking.");
    }
  };

  const confirmDeleteBooking = (bookingId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteBooking(bookingId),
          style: "destructive",
        },
      ]
    );
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
  };

  const handleLogout = async () => {
    logoutUser(navigation);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderBookingCard = (booking, idx) => (
    <View key={idx} style={styles.bookingCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.bookingTitle}>{booking.roomName}</Text>
        <TouchableOpacity onPress={() => confirmDeleteBooking(booking.id)}>
          <Ionicons name="trash-outline" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>

      {booking.location && (
        <Text style={styles.bookingInfo}>📍 {booking.location}</Text>
      )}
      <Text style={styles.bookingInfo}>
        {new Date(booking.bookingDate).toDateString()}
      </Text>
      <Text style={styles.bookingInfo}>Timeslot: {booking.timeslot}</Text>
      {booking.secondaryEmail && (
        <Text style={styles.bookingInfo}>Secondary Contact: {booking.secondaryEmail}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      <View style={styles.sliderWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSlider}
        >
          {dateList.map((d) => (
            <TouchableOpacity
              key={d.value}
              onPress={() => setSelectedDate(d.value)}
              style={[
                styles.dateButton,
                selectedDate === d.value && styles.dateButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.dateLabel,
                  selectedDate === d.value && styles.dateLabelActive,
                ]}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : filteredBookings.length === 0 ? (
          <Text style={styles.noBookingText}>
            No bookings for {selectedDate}.
          </Text>
        ) : (
          <>
            <Text style={styles.sectionHeader}>
              Bookings for {selectedDate}
            </Text>
            {filteredBookings.map(renderBookingCard)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoutContainer: {
    alignItems: "flex-end",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1d",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  sliderWrapper: {
    paddingBottom: 10,
  },
  dateSlider: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
  },
  dateButtonActive: {
    backgroundColor: "#1c1c1d",
  },
  dateLabel: {
    fontSize: 14,
    color: "#555",
  },
  dateLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1d",
    marginBottom: 10,
    textAlign: "center",
  },
  bookingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1d",
    marginBottom: 4,
  },
  bookingInfo: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  noBookingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
});
