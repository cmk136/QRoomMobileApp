import axios from "axios";

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
      const response = await axios.post('', { email });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
  }
};

// Verify if OTP is still valid and matches
export const verifyOtp = async (email, otp) => {
  try {
      const response = await axios.post('', { email, otp });
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
  }
}

// StoreDeviceId on register
export const storeDeviceId = async (email, deviceId) => {
  try {
    const response = await axios.post('', { email, deviceId });
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
}
