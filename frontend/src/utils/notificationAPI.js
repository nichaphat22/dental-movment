import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_NOTIFICATION_API_URL ||
  "http://localhost:8080/api/notifications";

export default API_URL;

//ดึง token จาก localstorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ดึงแจ้งเตือนของผู้ใช้ที่ล็อกอิน
export const getUserNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/user`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    throw error;
  }
};

// อัปเดตแจ้งเตือนเป็น "อ่านแล้ว"
export const markNotificationsAsRead = async (notificationIds) => {
    try {
      const response = await axios.put(
        `${API_URL}/mark-read`,
        { notificationIds },  // ใช้ notificationIds ที่เป็น array
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error marking notifications as read:", error);
      throw error;
    }
  };
  

// ลบแจ้งเตือน
export const deleteNotification = async (notificationId) => {
    try {
      console.log("API Request to delete notification ID:", notificationId); // ✅ ตรวจสอบค่า ID
      const response = await axios.delete(`${API_URL}/${notificationId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting notification:", error.response?.data || error.message);
      throw error;
    }
  };
  
