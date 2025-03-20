import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from './notificationSlice';
import authReducer from './authSlice';

const store = configureStore({
    reducer: {
        notifications: notificationReducer,
        auth: authReducer,

    },
});

export default store;