import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigation = useNavigation();
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchAuthState = async () => {
      setLoading(true);
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        if (!accessToken || accessToken === "null") {
          console.log("No valid access token. Skipping user check.");
          setLoading(false);
          return;
        }

        const user = await getUserData(); // Only call if token is present
        if (!user) throw new Error("User not found");

        setUserData(user);
        setIsLoggedin(true);
      } catch (err) {
        await hardLogout(); // clean up any bad session
      } finally {
        setLoading(false);
      }
    };

    fetchAuthState();
  }, []);

  const getUserData = async () => {
    try {
      const userResponse = await fetchWithAuth("https://6rf5b9p1l7.execute-api.ap-southeast-1.amazonaws.com/prod/userData");
      if (!userResponse.ok) {
        const err = await userResponse.text();
        console.error("User data fetch failed:", err);
        throw new Error("Failed to fetch user data");
      }
      return await userResponse.json();
    } catch (error) {
      console.error("getUserData error:", error.message);
      return null;
    }
  };

  const loginUser = async (email, password, navigation) => {
    try {
      const response = await fetch("https://fqpoqnrwzi.execute-api.ap-southeast-1.amazonaws.com/prod/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (data.requiresVerification) {
        navigation.replace("OtpVerification", { email });
        return data;
      }

      if (!data.accessToken) {
        Alert.alert("Login Failed", data.message);
        return false;
      }

      await AsyncStorage.setItem("accessToken", data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
      await AsyncStorage.setItem("userEmail", email);
      setIsLoggedin(true);

      const user = await getUserData();
      if (user) {
        setUserData(user);
        return true;
      } else {
        Alert.alert("Error", "Failed to fetch user details. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await fetchWithAuth("https://rz8fq4olpi.execute-api.ap-southeast-1.amazonaws.com/prod/logout", {
        method: "POST",
      });
    } catch (e) {
      console.log("Failed to notify backend during logout:", e.message);
    }
    await hardLogout();
  };

  const hardLogout = async () => {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    setIsLoggedin(false);
    setUserData(null);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
    console.log("Logged out and navigation reset.");
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch("https://qw7fjs2n79.execute-api.ap-southeast-1.amazonaws.com/prod/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.accessToken) {
        console.error("Failed to refresh token:", data.message || "Unknown error");
        return null;
      }

      await AsyncStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let accessToken = await AsyncStorage.getItem("accessToken");
    console.log("Initial accessToken:", accessToken);

    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    };

    let response = await fetch(url, fetchOptions);

    if (response.status === 401 || response.status === 403) {
      console.log("Access token expired. Attempting to refresh...");
      accessToken = await refreshToken();
      console.log("New accessToken:", accessToken);

      if (!accessToken) {
        console.log("Refresh token expired. Logging out...");
        await hardLogout();
        throw new Error("Session expired. Please log in again.");
      }

      fetchOptions.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, fetchOptions);
    }

    return response;
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedin,
        loading,
        userData,
        loginUser,
        logoutUser,
        fetchWithAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
