import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckInAuth() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="green" />
      <Text style={styles.text}>You're Checked In!</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  text: { fontSize: 24, fontWeight: "bold", marginTop: 20, marginBottom: 30 },
  button: { padding: 15, backgroundColor: "#007bff", borderRadius: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
