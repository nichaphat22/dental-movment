import { createSlice } from "@reduxjs/toolkit";
// import { deleteNotification, markAsRead } from "../../../backend/Controllers/notificationController";
// import { deleteNotification as deleteNotificationA, markAsRead as markAsReadA } from "../../../backend/Controllers/notificationController";

const notificationSlice = createSlice({
    name: "notifications",
    initialState: { list: [], unreadCount: 0 },
    reducers: {
        setNotifications: (state, action) => {
            state.list = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;

        },
        addNotification: (state, action) => {
            state.list.unshift(action.payload);
            state.unreadCount += 1;
        },
        markAsReadReducer: (state, action) => {
            const notification = state.list.find(n => n._id === action.payload);
            if (notification) notification.isRead = true;
            state.unreadCount = state.list.filter(n => !n.isRead).length;

        },
        deleteNotificationReducer: (state, action) => {
            state.list = state.list.filter(n => n._id !== action.payload);
            state.unreadCount = state.list.filter(n => !n.isRead).length;
        }
    }
});

export const { setNotifications, addNotification, markAsReadReducer, deleteNotificationReducer } = notificationSlice.actions;
export default notificationSlice.reducer;