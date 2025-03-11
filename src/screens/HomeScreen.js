import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { getUserDetails } from "../api/authService"; // ✅ Updated path

const HomeScreen = ({ navigation, route }) => {
  const [userName, setUserName] = useState(route.params?.userName || "Guest");
  const [loading, setLoading] = useState(true);

  const token = route.params?.token || "";

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const userData = await getUserDetails(token);
        setUserName(userData.name);
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to fetch user data");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Text style={styles.title}>Hello, {userName}!</Text>
      )}

      <Button title="Logout" onPress={() => navigation.replace("Login")} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
