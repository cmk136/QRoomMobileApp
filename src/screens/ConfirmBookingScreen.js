import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";

export default function ConfirmBookingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { fetchWithAuth } = useContext(AppContext);
  const { room, date, timeslots } = route.params;

  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const response = await fetchWithAuth(
        "https://d0zf6gz51b.execute-api.ap-southeast-1.amazonaws.com/prod/bookRoom",
        {
          method: "POST",
          body: JSON.stringify({
            id: room.id,
            date,
            timeslots,
            secondary: secondaryEmail || null,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Room booked successfully!", [
          { text: "OK", onPress: () => navigation.navigate("Dashboard") },
        ]);
      } else {
        throw new Error(data.message || "Booking failed");
      }
    } catch (error) {
      const friendlyMessage = error?.message || "Something went wrong while booking.";
      Alert.alert("Booking Failed", friendlyMessage);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Confirm Booking</Text>

        <View style={styles.detail}>
          <Text style={styles.label}>Room:</Text>
          <Text style={styles.value}>{room.roomName}</Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.label}>Timeslots:</Text>
          <Text style={styles.value}>{timeslots.join(", ")}</Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.label}>Secondary Contact (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            keyboardType="email-address"
            value={secondaryEmail}
            onChangeText={setSecondaryEmail}
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancel]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirm]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Booking..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1c1c1d",
  },
  detail: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#1c1c1d",
    marginTop: 4,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancel: {
    backgroundColor: "#ccc",
  },
  confirm: {
    backgroundColor: "#1c1c1d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
