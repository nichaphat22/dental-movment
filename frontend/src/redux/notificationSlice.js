import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notifications",
    initialState: { list: [], unreadCount: 0 },
    reducers: {
        setNotifications: (state, action) => {
            state.list = action.payload;
            state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        },
        addNotification: (state, action) => {
            const exists = state.list.some(n => n._id === action.payload._id);
            if (!exists) {
                state.list.unshift(action.payload); // เพิ่มแจ้งเตือนใหม่
                state.unreadCount += 1;
            }
        },
        markAsReadReducer: (state, action) => {
            const ids = Array.isArray(action.payload) ? action.payload : [action.payload]; // แปลงเป็น array ถ้าไม่ใช่
            ids.forEach(id => {
              const notification = state.list.find(n => n._id === id);
              if (notification) notification.isRead = true;
            });
            state.unreadCount = state.list.filter((n) => !n.isRead).length;
          },
          deleteNotificationReducer: (state, action) => {
            const idToDelete = action.payload;
            state.list = state.list.filter(n => n._id !== idToDelete);
            state.unreadCount = state.list.filter(n => !n.isRead).length;
          }          
    }
});

export const { setNotifications, addNotification, markAsReadReducer, deleteNotificationReducer } = notificationSlice.actions;
export default notificationSlice.reducer;
