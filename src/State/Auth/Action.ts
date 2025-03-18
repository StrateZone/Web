import axios from "axios";

export const sendOtp = async (email: string) => {
  try {
    const response = await axios.post(
<<<<<<< HEAD
      `https://backend-production-5bc5.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email)}`,
=======
      `https://backend-production-5bc5.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email)}`
>>>>>>> e11fdd8 (Improve UI components: navbar & banner hero)
    );

    return response.status === 200;
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    return false;
  }
};
