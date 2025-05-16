import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const { width } = Dimensions.get("window");

export default function RoomBookingScreen() {
  const { fetchWithAuth } = useContext(AppContext);
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const today = new Date();
    const todayFormatted = formatLocalDate(today);
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const label = `${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })} • ${weekDays[date.getDay()]}`;
      const value = formatLocalDate(date);
      weekDates.push({ label, value });
    }

    setDateOptions(weekDates);
    setSelectedDate(todayFormatted);
  }, []);

  useEffect(() => {
    fetchRoomsByDate();
  }, []);

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchRoomsByDate = async () => {
    try {
      const response = await fetchWithAuth(
        `https://2bah56rvzb.execute-api.ap-southeast-1.amazonaws.com/prod/getCompanyAndRoom`
      );
      const data = await response.json();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const openRoom = (room) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRoom(null);
  };

  const showInfoAlert = () => {
    Alert.alert(
      "How to Use",
      "Select a date from the dropdown menu and tap 'Search' to view and book available rooms on that day."
    );
  };

  const handleSearch = () => {
    const todayFormatted = formatLocalDate(new Date());
    if (selectedDate < todayFormatted) {
      Alert.alert("Invalid Date", "You can only search for bookings from today onward.");
      return;
    }
    navigation.navigate("TimeSlotScreen", { date: selectedDate });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.dropdownRow}>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedDate}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedDate(itemValue)}
              dropdownIconColor="#fff"
            >
              {dateOptions.map((date) => (
                <Picker.Item
                  label={date.label}
                  value={date.value}
                  key={date.value}
                  color="#000"
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity onPress={showInfoAlert} style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={24} color="#1c1c1d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.header}>Book a Room</Text>

        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.roomList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openRoom(item)}>
              <Image source={{ uri: item.imageURLs?.[0] }} style={styles.thumbnail} />
              <View style={styles.roomContent}>
                <Text style={styles.roomTitle}>{item.roomName}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        useNativeDriver
        hideModalContentWhileAnimating
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {selectedRoom && (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  {selectedRoom.imageURLs?.map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      style={styles.fullImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                <Text style={styles.roomName}>{selectedRoom.roomName}</Text>
                <Text style={styles.roomDetail}>📍 {selectedRoom.location}</Text>
                <Text style={styles.roomDetail}>👥 Capacity: {selectedRoom.capacity}</Text>
                <Text style={styles.roomDesc}>{selectedRoom.description}</Text>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1c1c1d",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dropdownContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 30,
    marginRight: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  infoIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: "#1c1c1d",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    justifyContent: "center",
  },
  searchText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  roomList: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  roomContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1d",
    marginBottom: 4,
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalContentWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  imageRow: {
    width: "100%",
  },
  fullImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#1c1c1d',
  },
  roomDetail: {
    fontSize: 14,
    marginTop: 6,
    color: "#555",
  },
  roomDesc: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
});
