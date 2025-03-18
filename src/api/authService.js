import axios from "axios";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Login API Call
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post('https://fqpoqnrwzi.execute-api.ap-southeast-1.amazonaws.com/prod/login', { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      // Explicitly check if this is an OTP verification error
      if (status === 403 && data.requiresVerification) {
        return { requiresVerification: true }; // Handle OTP verification flow
      }

      // Return the actual error message for other cases
      throw data || { message: "Unknown server error" };
    }

    // Handle network or unknown errors
    throw { message: "Network error" };
  }
};

// Send OTP to users via email
export const sendVerifyOtp = async (email) => {
  try {
      const response = await axios.post('https://8vsanyv1b3.execute-api.ap-southeast-1.amazonaws.com/prod/sendVerifyOtp', { email });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
  }
};

// Verify if OTP is still valid and matches
export const verifyOtp = async (email, otp) => {
  try {
      const response = await axios.post('https://2dj1t5cuhd.execute-api.ap-southeast-1.amazonaws.com/prod/verifyOtp', { email, otp });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
  }
}

// Fetch User Bookings API Call
export const fetchUserBookings = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    console.log('from bookings',accessToken);
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await axios.get(
      "https://velilo080f.execute-api.ap-southeast-1.amazonaws.com/prod/fetchUsersBooking",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data.bookings;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

// Register Device API Call
export const registerDevice = async (userId, deviceId) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await axios.post(
      "https://43eextcx60.execute-api.ap-southeast-1.amazonaws.com/prod/registerDevice", 
      { userId, deviceId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};
