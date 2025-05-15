import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

const ChangePasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [criteria, setCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const validatePassword = (password) => {
    setCriteria({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = async () => {
    if (!Object.values(criteria).every(Boolean)) {
      Alert.alert("Error", "Password does not meet all security requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("https://n1mmmualre.execute-api.ap-southeast-1.amazonaws.com/prod/changeInitialPasswordAPI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      Alert.alert("Success", "Password changed successfully!");
      navigation.replace("BiometricScreen", { email, from: "AccountSetup" });
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Your Password</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          validatePassword(text);
        }}
        secureTextEntry
      />

      <View style={styles.criteriaContainer}>
        <Text style={criteria.length ? styles.validCriteria : styles.invalidCriteria}>
          {criteria.length ? "✅" : "❌"} Minimum 8 characters
        </Text>
        <Text style={criteria.upper ? styles.validCriteria : styles.invalidCriteria}>
          {criteria.upper ? "✅" : "❌"} At least one uppercase letter
        </Text>
        <Text style={criteria.lower ? styles.validCriteria : styles.invalidCriteria}>
          {criteria.lower ? "✅" : "❌"} At least one lowercase letter
        </Text>
        <Text style={criteria.number ? styles.validCriteria : styles.invalidCriteria}>
          {criteria.number ? "✅" : "❌"} At least one number
        </Text>
        <Text style={criteria.special ? styles.validCriteria : styles.invalidCriteria}>
          {criteria.special ? "✅" : "❌"} At least one special character
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  criteriaContainer: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 15,
  },
  validCriteria: {
    color: "green",
    fontSize: 14,
  },
  invalidCriteria: {
    color: "red",
    fontSize: 14,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
