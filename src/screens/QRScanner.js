import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import jwtDecode from "jwt-decode"; // Optional: install via `npm install jwt-decode`

export default function QRScanner() {
  const [hasScanned, setHasScanned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // New: prevent multiple verifications
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const { fetchWithAuth } = useContext(AppContext);

  const verifyUserWithBackend = async (checkInJwt) => {
    setIsVerifying(true); // Lock scanning while verifying

    try {
      // Debug: decode JWT expiry (optional)
      try {
        const decoded = jwtDecode(checkInJwt);
        console.log("JWT decoded:", decoded);
        console.log("Expires at:", new Date(decoded.exp * 1000));
      } catch (e) {
        console.log("JWT decode failed or not a JWT.");
      }

      const response = await fetchWithAuth(
        "https://7r51juw656.execute-api.ap-southeast-1.amazonaws.com/prod/verifyUserBooking",
        {
          method: "POST",
          body: JSON.stringify({ checkInJwt }),
        }
      );
      console.log("Function ran");

      const data = await response.json();

      if (!data.success) {
        Alert.alert("Verification Failed", "QR code is invalid or expired.");
        return;
      }

      const level = data.securityLevel;
      const bookingId = data.bookingId;

      console.log("Level:", level);

      if (!bookingId) {
        Alert.alert("Error", "Booking ID missing. Cannot proceed.");
        return;
      }

      if (level === 1) {
        try {
          const unlockResponse = await fetchWithAuth(
            "https://c66lw5x49g.execute-api.ap-southeast-1.amazonaws.com/prod/setIsUnlocked",
            {
              method: "POST",
              body: JSON.stringify({ bookingId }),
            }
          );

          const unlockData = await unlockResponse.json();

          if (unlockData.success) {
            navigation.replace("CheckInAuth", {
              level,
              bookingId,
            });
          } else {
            Alert.alert("Unlock Failed", unlockData.message || "Unable to unlock room.");
          }
        } catch (error) {
          console.error("Unlock API Error:", error);
          Alert.alert("Error", "An error occurred while unlocking the room.");
        }

      } else if (level === 2 || level === 3) {
        navigation.replace("BioCheckAuth", {
          level,
          bookingId,
        });

      } else {
        Alert.alert("Invalid Security Level");
      }

    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setIsVerifying(false); // Unlock scanning after verification
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (hasScanned || isVerifying) return; // Prevent multiple scans
    setHasScanned(true);
    verifyUserWithBackend(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      >
        {isVerifying && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loaderText}>Verifying...</Text>
          </View>
        )}
        {hasScanned && !isVerifying && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setHasScanned(false)}
          >
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
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },
  loaderContainer: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
});
