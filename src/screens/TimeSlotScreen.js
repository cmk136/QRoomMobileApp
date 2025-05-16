import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function TimeSlotSelectionScreen() {
  const { fetchWithAuth } = useContext(AppContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { date } = route.params;
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});

  const fetchAvailableRooms = async () => {
    setLoading(true);
    try {
      const url = `https://du06ie4bsl.execute-api.ap-southeast-1.amazonaws.com/prod/getAvailableRooms?date=${date}`;

      const response = await fetchWithAuth(url);
      const data = await response.json();

      console.log("Rooms fetched:", data.rooms?.length || 0);
      console.log("Room data:", data.rooms);
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, [date]);

  const handleToggleSlot = (roomId, timeslot) => {
    setSelectedSlots((prev) => {
      const current = prev[roomId] || [];
      if (current.includes(timeslot)) {
        return { ...prev, [roomId]: current.filter((t) => t !== timeslot) };
      }
      if (current.length >= 2) {
        Alert.alert("Limit Reached", "You can only book up to 2 hours per room.");
        return prev;
      }
      return { ...prev, [roomId]: [...current, timeslot].sort() };
    });
  };

  const handleProceedToBooking = (room) => {
    const timeslots = selectedSlots[room.id];
    if (!timeslots || timeslots.length === 0) {
      Alert.alert("Select Timeslot", "Please select at least one timeslot.");
      return;
    }
    navigation.navigate("ConfirmBookingScreen", {
      room,
      date,
      timeslots,
    });
  };

  const renderTimeslot = (roomId, timeslot) => {
    const isSelected = selectedSlots[roomId]?.includes(timeslot);
    return (
      <TouchableOpacity
        key={timeslot}
        style={[styles.timeslotPill, isSelected && styles.timeslotPillActive]}
        onPress={() => handleToggleSlot(roomId, timeslot)}
      >
        <Text style={[styles.timeslotText, isSelected && styles.timeslotTextActive]}>
          {timeslot.slice(0, 5)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRoom = ({ item }) => (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {item.images?.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.roomInfo}>
        <Text style={styles.roomTitle}>{item.roomName}</Text>
        <Text style={styles.roomSubtitle}>{item.location}</Text>
        <Text style={styles.roomCapacity}>👥 {item.capacity} people</Text>
        <Text style={styles.roomDesc}>{item.description}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.availableTimeslots.map((slot) => renderTimeslot(item.id, slot))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSlots[item.id] || selectedSlots[item.id].length === 0) &&
              styles.bookButtonDisabled,
          ]}
          onPress={() => handleProceedToBooking(item)}
          disabled={!selectedSlots[item.id] || selectedSlots[item.id].length === 0}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatDateLocal = (isoDate) => {
    const [y, m, d] = isoDate.split("-");
    const localDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return localDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#007bff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Select Time Slots</Text>
          <Text style={styles.dateSubtitle}>for {formatDateLocal(date)}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1c1c1d" />
      ) : rooms.length === 0 ? (
        <Text style={styles.empty}>No rooms available on this date.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRoom}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1c1d",
  },
  dateSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
  },
  imageScroll: {
    maxHeight: 180,
  },
  thumbnail: {
    width: width - 60,
    height: 160,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 10,
    marginLeft: 14,
  },
  roomInfo: {
    padding: 14,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1d",
    marginBottom: 2,
  },
  roomSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  roomCapacity: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  roomDesc: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  timeslotPill: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  timeslotPillActive: {
    backgroundColor: "#1c1c1d",
  },
  timeslotText: {
    color: "#1c1c1d",
    fontSize: 13,
    fontWeight: "500",
  },
  timeslotTextActive: {
    color: "#fff",
  },
  bookButton: {
    marginTop: 12,
    backgroundColor: "#1c1c1d",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
