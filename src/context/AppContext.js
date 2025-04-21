import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigation = useNavigation();
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Check authentication state on app load
  useEffect(() => {
    const fetchAuthState = async () => {
      setLoading(true);
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("No access token found. Skipping fetch.");
          setLoading(false);
          return;
        }
  
        const response = await fetchWithAuth("https://0ggse9qpsj.execute-api.ap-southeast-1.amazonaws.com/prod/is-auth");
        if (!response.ok) throw new Error("Not authenticated");
  
        const user = await getUserData();
        if (user) {
          setUserData(user);
          setIsLoggedin(true);
          console.log("Set user data:", user);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        await logoutUser();
      } finally {
        setLoading(false);
      }
    };
  
    fetchAuthState();
  }, []);

  // Fetch user data
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

  // Login user
  const loginUser = async (email, password) => {
    try {
      const response = await fetch("https://fqpoqnrwzi.execute-api.ap-southeast-1.amazonaws.com/prod/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("Login Response:", data);
  
      if (data.requiresVerification) {
        Alert.alert("Account is not yet verified. Please verify your account in Qroom App");
        return false;
      }
  
      if (!data.accessToken) {
        Alert.alert("Login Failed", data.message);
        return false;
      }
  
      await AsyncStorage.setItem("accessToken", data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
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
      const response = await fetchWithAuth("https://rz8fq4olpi.execute-api.ap-southeast-1.amazonaws.com/prod/logout", {
        method: "POST",
      });

      await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      setIsLoggedin(false);
      setUserData(null);

      navigation.navigate("Login");
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch("https://qw7fjs2n79.execute-api.ap-southeast-1.amazonaws.com/prod/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Fetch API with authentication
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
        logoutUser();
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
