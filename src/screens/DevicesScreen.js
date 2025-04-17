import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";


const DevicesScreen = ({ navigation }) => {
  const { fetchWithAuth } = useContext(AppContext);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("https://07e2pbmve3.execute-api.ap-southeast-1.amazonaws.com/prod/fetchDevices");
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
      Alert.alert("Error", error.message || "Failed to fetch devices.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleAddDevice = async () => {
    try {
      if (devices.length >= 3) {
        Alert.alert(
          "Device Limit Reached",
          "You can only register up to 3 devices. Please remove one before adding a new device."
        );
        return;
      }
  
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) throw new Error("User not authenticated.");
  
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) {
        Alert.alert("Error", "Email not found. Cannot continue.");
        return;
      }
  
      navigation.navigate("OtpVerification", {
        email,
        from: "AddDevice",
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Could not start device registration.");
    }
  };
  

  const handleRemoveDevice = (deviceId) => {
    Alert.alert("Remove Device", "Are you sure you want to remove this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetchWithAuth(
              "https://p56bfhy2b1.execute-api.ap-southeast-1.amazonaws.com/prod/deleteDevice",
              {
                method: "POST",
                body: JSON.stringify({ deviceId }),
              }
            );

            const data = await response.json();

            if (response.ok) {
              Alert.alert("Success", "Device removed successfully.");
              loadDevices();
            } else {
              throw new Error(data.message || "Failed to remove device.");
            }
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to remove device.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => navigation.replace("Dashboard", { initialTab: "Profile" })}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1c1c1d" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
  
      <Text style={styles.title}>Devices</Text>
  
      <View style={styles.contentArea}>
        {loading ? (
          <ActivityIndicator size="large" color="#1c1c1d" style={{ marginTop: 30 }} />
        ) : devices.length > 0 ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.subtitle}>Your Connected Devices:</Text>
            {devices.map((device, index) => (
              <View key={index} style={styles.deviceCard}>
                <Text style={styles.deviceText}>{device.deviceName}</Text>
                <TouchableOpacity onPress={() => handleRemoveDevice(device.id)}>
                  <Ionicons name="trash-outline" size={22} color="#1c1c1d" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.noDeviceText}>You have no connected devices.</Text>
          </View>
        )}
      </View>
  
      <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
        <Ionicons name="add-outline" size={24} color="#ffffff" />
        <Text style={styles.addButtonText}>Add Device</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );  
};

export default DevicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 8,
    color: "#1c1c1d",
    fontSize: 16,
    fontWeight: "600",
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
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
  deviceCard: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceText: {
    fontSize: 16,
    color: "#1c1c1d",
  },
  noDeviceText: {
    fontSize: 16,
    color: "#28282a",
    textAlign: "center",
    marginTop: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c1c1d",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  contentArea: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
});
