import axios from "axios";

const API_URL = "http://localhost:8080/api/notifications";

//ดึงแจ้งเตือนทั้งหมด
export const getNotifications = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

// ฟังก์ชันการอัปเดตสถานะการแจ้งเตือนเป็น "อ่านแล้ว"
export const markNotificationAsRead = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/${id}/read`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

//ลบแจ้งเตือน
export const deleteNotification = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};

