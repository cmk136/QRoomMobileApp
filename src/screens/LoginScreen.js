import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginUser } = useContext(AppContext);

  const blobs = [
    { cx: useSharedValue(width * 0.3), cy: useSharedValue(height * 0.2), r: useSharedValue(90), fill: "#c1c1c1", opacity: 0.3, dx: width * 0.35, dy: height * 0.25, dr: 110, dur: 8000 },
    { cx: useSharedValue(width * 0.7), cy: useSharedValue(height * 0.7), r: useSharedValue(70), fill: "#a1a1a1", opacity: 0.3, dx: width * 0.6, dy: height * 0.6, dr: 90, dur: 7000 },
    { cx: useSharedValue(width * 0.5), cy: useSharedValue(height * 0.4), r: useSharedValue(100), fill: "#888888", opacity: 0.25, dx: width * 0.4, dy: height * 0.55, dr: 120, dur: 9000 },
    { cx: useSharedValue(width * 0.25), cy: useSharedValue(height * 0.8), r: useSharedValue(75), fill: "#666666", opacity: 0.3, dx: width * 0.3, dy: height * 0.6, dr: 100, dur: 9500 },
    { cx: useSharedValue(width * 0.8), cy: useSharedValue(height * 0.2), r: useSharedValue(85), fill: "#444444", opacity: 0.25, dx: width * 0.7, dy: height * 0.3, dr: 110, dur: 10000 },
  ];

  const animatedPropsList = blobs.map((blob) => {
    useEffect(() => {
      blob.cx.value = withRepeat(withTiming(blob.dx, { duration: blob.dur, easing: Easing.inOut(Easing.ease) }), -1, true);
      blob.cy.value = withRepeat(withTiming(blob.dy, { duration: blob.dur + 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
      blob.r.value = withRepeat(withTiming(blob.dr, { duration: blob.dur + 1000, easing: Easing.linear }), -1, true);
    }, []);
    return useAnimatedProps(() => ({
      cx: blob.cx.value,
      cy: blob.cy.value,
      r: blob.r.value,
    }));
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email, password, navigation);
      if (response?.requiresVerification) {
        navigation.replace("OtpVerification", { email });
        return;
      }

      if (response) {
        navigation.replace("Dashboard");
      } else {
        Alert.alert("Login Failed", response.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Login Error", error.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {blobs.map((blob, index) => (
          <AnimatedCircle key={index} animatedProps={animatedPropsList[index]} fill={blob.fill} opacity={blob.opacity} />
        ))}
      </Svg>

      <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />

      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#28282a"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#28282a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#1c1c1d" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    zIndex: 3,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1c1c1d",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#f5f5f3",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#1c1c1d",
    backgroundColor: "#ffffff",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  button: {
    backgroundColor: "#1c1c1d",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
