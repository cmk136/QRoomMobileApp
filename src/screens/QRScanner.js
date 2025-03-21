import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext"; 

export default function QRScanner() {
  const [hasScanned, setHasScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const {fetchWithAuth} = useContext(AppContext);

  // Send JWT token to backend for verification
  const verifyUserWithBackend = async (checkInJwt) => {
    try {
      const response = await fetchWithAuth(
        "https://7r51juw656.execute-api.ap-southeast-1.amazonaws.com/prod/verifyUserBooking",
        { 
          method: "POST", 
          body: JSON.stringify({checkInJwt})
        }
      );

      const data = await response.json();
      console.log("🔹 Server Response:", data);

      if (data.success) {
        Alert.alert("Verification Successful", "Identity verified successfully.");
        navigation.replace("BioCheckAuth");
      } else {
        Alert.alert("Verification Failed", "Identity verification failed.");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  // Handle permissions
  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Handle QR code scanning
  const handleBarCodeScanned = ({ data }) => {
    setHasScanned(true);
    verifyUserWithBackend(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {hasScanned && (
          <TouchableOpacity style={styles.scanAgainButton} onPress={() => setHasScanned(false)}>
            <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
  },
  scanAgainText: {
    color: "white",
    fontSize: 16,
  },
});
