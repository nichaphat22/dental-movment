import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8800"); // URL ของ WebSocket server

// สร้าง Context
const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // เชื่อมต่อกับ socket.io
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket server");
    });

    socket.on("newNotification", (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket server");
    });

    // ล้างการเชื่อมต่อเมื่อคอมโพเนนต์นี้ถูกทำลาย
    return () => {
      socket.off("newNotification");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};
