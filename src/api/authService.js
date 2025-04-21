import axios from "axios";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Change Initial Password API Call
export const changeInitialPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(
      "https://n1mmmualre.execute-api.ap-southeast-1.amazonaws.com/prod/changeInitialPasswordAPI",
      { email, newPassword }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

// Register Device API Call
export const registerDevice = async (email, deviceId, deviceName) => {
  try {
    // Log the details being posted for debugging
    console.log("Posting device registration data:", { email, deviceId, deviceName });

    const response = await axios.post(
      "https://43eextcx60.execute-api.ap-southeast-1.amazonaws.com/prod/registerDevice",
      { email, deviceId, deviceName }
    );

    // Log the response data for debugging
    console.log("Response from registerDevice:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error in registerDevice API call:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

// Fetch User Devices 
export const fetchUserDevices = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await axios.post(
      "https://07e2pbmve3.execute-api.ap-southeast-1.amazonaws.com/prod/fetchDevices", 
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.devices;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

//Verify Device -> OTP
export const verifyDeviceOtp = async (otp) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Access token not found.");
    }

    const response = await fetch(
      "https://pok91tugyk.execute-api.ap-southeast-1.amazonaws.com/prod/verifyOtpDevice",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "OTP verification failed");
    }

    return result;
  } catch (error) {
    console.error("verifyDeviceOtp error:", error);
    throw error;
  }
};

// Send OTP to Verify Device
export const sendDeviceVerifyOtp = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found.");
    }

    const response = await fetch(
      "https://nwndykuo0a.execute-api.ap-southeast-1.amazonaws.com/prod/deviceSendVerifyOtp",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send OTP.");
    }

    return result;
  } catch (error) {
    console.error("sendDeviceVerifyOtp error:", error);
    throw error;
  }
};

//Adding New Device
export const addUserDevice = async (deviceId, deviceName) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) throw new Error("No access token found.");

    const response = await fetch(
      "https://h5pu37tklb.execute-api.ap-southeast-1.amazonaws.com/prod/addDevice",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId, deviceName }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add device.");
    }

    return result;
  } catch (error) {
    console.error("addUserDevice error:", error);
    throw error;
  }
};
