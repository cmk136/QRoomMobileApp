import axios from "axios";
import API_BASE_URL from "./apiConfig"; // ✅ Corrected path

// Login API Call
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    return response.data; // { success: true, token: "...", name: "John Doe" }
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

// Fetch User Details API
export const getUserDetails = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};
