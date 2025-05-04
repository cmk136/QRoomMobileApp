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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";

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
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const label = `${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })} • ${weekDays[date.getDay()]}`;
      const value = date.toISOString().split("T")[0];
      weekDates.push({ label, value });
    }

    setDateOptions(weekDates);
    setSelectedDate(weekDates[0]?.value);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchRoomsByDate();
    }
  }, [selectedDate]);

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

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate("TimeSlotScreen", { date: selectedDate })}
          >
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

      <Modal isVisible={isModalVisible} onBackdropPress={closeModal} style={styles.modal}>
        <TouchableOpacity style={styles.modalCloseOutside} onPress={closeModal} />
        <View style={styles.modalContent}>
          {selectedRoom && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
  },
  modalCloseOutside: {
    flex: 1,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    position: "absolute",
    bottom: 0,
  },
  fullImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  roomName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#1c1c1d",
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
