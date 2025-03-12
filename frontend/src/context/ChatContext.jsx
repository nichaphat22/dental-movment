import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest, putRequest, patchRequest } from "../utils/services";
import { io } from "socket.io-client";
// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [messagesRead, setMessagesRead] = useState([]);


    // const { recipientUser } = useFetchRecipientUser(currentChat, user);

    // console.log(/"currentChat", currentChat)

    useEffect(() => {
        if (!user?._id) return;
        // wss://backend-dot-project-it-410215.uc.r.appspot.com
        // const newSocket = io("http://localhost:8080");
       // กำหนด URL สำหรับการเชื่อมต่อ WebSocket
    // const socketUrl = 'https://backend-dot-project-it-410215.uc.r.appspot.com';
    const socketUrl = 'http://localhost:8080';

    // สร้างการเชื่อมต่อ WebSocket
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'], // ใช้ทั้ง WebSocket และ polling
    });
        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
            setSocket(newSocket);

            // แจ้ง server ว่าผู้ใช้ online และอัปเดต socketId
            newSocket.emit("addNewUser", { userId: user._id });
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Socket disconnected:", newSocket.id);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user?._id]);

    // useEffect สำหรับการส่งข้อความใหม่
    useEffect(() => {
        if (socket === null) return;
        const recipientId = currentChat?.members?.find((id) => id !== user?._id);
        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage]);

    // รับข้อความและการแจ้งเตือน
    useEffect(() => {
        if (!socket) {
            return; // หยุดการทำงานถ้ายังไม่มีการเชื่อมต่อ socket
        }

        socket.on("getMessage", (message) => {
            console.log("📩 Received message:", message);
        
            // ถ้าเป็นแชทที่เปิดอยู่ ให้เพิ่มข้อความใหม่ในแชทปัจจุบัน
            if (currentChat?._id === message.chatId) {
                setMessages((prevMessages) => {
                    console.log("💬 Updating messages", prevMessages);
                    return prevMessages ? [...prevMessages, message] : [message];
                });
            }

            // อัพเดทแชทที่มีข้อความใหม่
      setUserChats((prevChats) => {
        const updatedChats = prevChats.map((chat) =>
          chat._id === message.chatId
            ? { ...chat, latestMessage: message, updatedAt: new Date() }
            : chat
        );

        // เรียงลำดับแชทใหม่หลังจากได้รับข้อความใหม่
        const sortedChats = updatedChats.sort((a, b) => {
          if (!a.latestMessage) return 1;
          if (!b.latestMessage) return -1;
          return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
        });

        return sortedChats;
      });
    });

   
        socket.on("getNotification", (notification) => {
            console.log("Notification received:", notification);

            if (notification.senderId === user._id) return;

            setNotifications((prevNotifications) => {
                // Avoid duplicate notifications
                if (!prevNotifications.some((notif) => notif._id === notification._id)) {
                    return [...prevNotifications, notification];
                }
                return prevNotifications;
            });

            if (!notification.isRead && notification.recipientId === user._id) {
                setUnreadNotifications((prevUnread) => {
                    // Avoid duplicate unread notifications
                    if (!prevUnread.some((notif) => notif._id === notification._id)) {
                        return [...prevUnread, notification];
                    }
                    return prevUnread;
                });
            }
            // ✅ รับ event "notificationRead" เมื่อข้อความถูกอ่าน
            socket.on("notificationRead", ({ senderId }) => {
                console.log("✅ Message read notification received for sender:", senderId);

                // ✅ อัปเดต Notifications ให้เป็น isRead: true
                setNotifications((prevNotifications) =>
                    prevNotifications.map((notif) =>
                        notif.senderId === senderId ? { ...notif, isRead: true } : notif
                    )
                );

                // ✅ ลบออกจาก Unread Notifications
                setUnreadNotifications((prevUnread) =>
                    prevUnread.filter((notif) => notif.senderId !== senderId)
                );
            });

        });

         // ✅ รับ event "messageRead" เมื่อข้อความถูกอ่าน
         socket.on("messageRead", ({ senderId, updatedMessages, recipientId }) => {
            console.log("✅ Message read event received for sender:", senderId);
            if (senderId === user._id) {
                console.log('updatedMessages', updatedMessages);
                
                // ✅ อัปเดตสถานะ isRead ของข้อความที่เกี่ยวข้อง
                setMessages((prevMessages) => 
                    // ตรวจสอบว่า prevMessages เป็นอาร์เรย์หรือไม่
                    Array.isArray(prevMessages) 
                        ? prevMessages.map((message) => {
                            return updatedMessages ? { ...message, isRead: true } : message;
                        })
                        : prevMessages // ถ้าไม่ใช่อาร์เรย์ ให้คืนค่า prevMessages โดยตรง
                );
            }
        });
        
        
        return () => {
            socket.off("messageRead");
            socket.off("getMessage");
            socket.off("getNotification");
            socket.off("notificationRead");
            // socket.off("newNotification");
        };
    }, [socket, user, currentChat]);  // ใช้ socket และ user เป็น dependencies

    const unreadChatsCount = (notifications, userId) => {
        if (!notifications || notifications.length === 0 || !userId) return 0;
    
        console.log("🔍 Calculating unread messages for user:", userId);
        
        return notifications.filter(
            (notification) => notification.senderId === userId && !notification.isRead
        ).length;
    };
    

    // console.log('messages',messages)

    // Fetch all users from API
    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                console.error("Error fetching users:", response);
                return;
            }

            // Separate students and teachers
            const students = response.filter((u) => u.role === 'student');
            const teachers = response.filter((u) => u.role === 'teacher');

            setAllUsers(response); // Set all users (students and teachers)

            // Filter out potential chats (teachers not already in userChats)
            const pChats = teachers.filter((teacher) => {
                let isChatCreated = false;

                if (user?._id === teacher._id) return false;

                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === teacher._id || chat.members[1] === teacher._id;
                    });
                }
                return !isChatCreated;
            });

            setPotentialChats(pChats);
        };

        getUsers();
    }, [userChats, user]);

    useEffect(() => {
        const getUserChats = async () => {
            if (!user?._id) return;
    
            setIsUserChatsLoading(true);
            setUserChatsError(null);
    
            try {
                const response = await getRequest(`${baseUrl}/chats/${user._id}`);
                setIsUserChatsLoading(false);
    
                if (response.error) {
                    setUserChatsError(response);
                    return;
                }
    
                // ดึงข้อความล่าสุดสำหรับแต่ละแชท
                const chatsWithLatestMessage = await Promise.all(
                    response.map(async (chat) => {
                        const latestMessageResponse = await getRequest(`${baseUrl}/messages/${chat._id}`);
                        if (!latestMessageResponse.error && latestMessageResponse.length > 0) {
                            const lastMessage = latestMessageResponse[latestMessageResponse.length - 1];
                            return { ...chat, latestMessage: lastMessage };
                        }
                        return { ...chat, latestMessage: null };
                    })
                );
    
                // เรียงลำดับแชทตาม timestamp ของข้อความล่าสุด
                const sortedChats = chatsWithLatestMessage.sort((a, b) => {
                    if (!a.latestMessage) return 1;  // แชทที่ไม่มีข้อความล่าสุดอยู่ด้านล่าง
                    if (!b.latestMessage) return -1; // แชทที่ไม่มีข้อความล่าสุดอยู่ด้านล่าง
                    return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
                });
                
    console.log('sortedChats',sortedChats)
                setUserChats(sortedChats);
            } catch (error) {
                setIsUserChatsLoading(false);
                setUserChatsError(error);
            }
        };
    
        getUserChats();
    }, [user, notifications]);  // เพิ่ม dependencies เพื่อให้โหลดใหม่เมื่อมีการเปลี่ยนแปลง
    
    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);

            try {
                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

                console.log("Messages response:", response);  // ตรวจสอบข้อมูลที่ได้

                if (response.error) {
                    setMessagesError(response);
                    return;
                }


                setMessages(response);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setMessagesError(error);
            } finally {
                setIsMessagesLoading(false);
            }
        };

        if (currentChat) {
            getMessages();
        }
    }, [currentChat]);

    const sendTextMessage = useCallback(
        async (textMessage, sender, currentChatId, fileMessage, setTextMessage, setFileMessage) => {
            if (!textMessage && !fileMessage) return console.log("You must type something...");

            const recipientId = currentChat?.members?.find((id) => id !== user?._id);
            if (!recipientId) return console.log("No recipient found!");

            try {
                const response = await postRequest(`${baseUrl}/messages`, {
                    chatId: currentChatId,
                    senderId: sender._id,
                    recipientId,
                    text: textMessage,
                    file: fileMessage,
                });

                if (response.error) {
                    console.error("Send message error:", response);
                    return;
                }

                // อัปเดตข้อความใหม่
                setNewMessage(
                    response);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    response.message
                ]);
                setTextMessage("");  // Clear the text input
                setFileMessage(null);  // Clear the file input

                // ส่งข้อความผ่าน Socket
                if (socket && socket.connected) {
                    socket.emit("sendMessage", { ...response.message, recipientId, });
                    // ส่งการแจ้งเตือนให้กับผู้รับ
                    socket.emit("getNotification", { ...response.notification ,recipientId,});
                }
            // อัปเดต userChats และเรียงลำดับใหม่
            setUserChats((prevChats) => {
                const updatedChats = prevChats.map((chat) => {
                    if (chat._id === currentChatId) {
                        // ปรับปรุงแชทที่ถูกส่งข้อความใหม่
                        return {
                            ...chat,
                            latestMessage: response.message,
                        };
                    }
                    return chat;
                });

                // เรียงลำดับแชทใหม่ตาม timestamp ของข้อความล่าสุด
                return updatedChats.sort((a, b) => {
                    if (!a.latestMessage) return 1;  // แชทที่ไม่มีข้อความล่าสุดอยู่ด้านล่าง
                    if (!b.latestMessage) return -1; // แชทที่ไม่มีข้อความล่าสุดอยู่ด้านล่าง
                    return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
                });
            });

        } catch (error) {
            console.error("Error sending message:", error);
        }
    },
    [currentChat, socket]
);

    useEffect(() => {
        // console.log("Updated messages:", messages);
    }, [messages]);


    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, [setCurrentChat]);

    // ฟังก์ชันเพื่ออัปเดตการแจ้งเตือนเป็น "อ่านแล้ว"
    const setNotificationsAsRead = async (senderId) => {
        console.log('senderId', senderId); // แสดงค่า id ที่ส่งเข้ามา คนรับ
        try {

            // ตรวจสอบเงื่อนไขก่อนทำงาน
            if (!senderId) {
                console.log('Skipping update for this senderId:', senderId);
                return; // ออกจากฟังก์ชันโดยไม่ทำอะไร
            }


            // 🔥 ส่ง API ไปอัปเดตใน MongoDB หรือ Firebase
            const response = await putRequest(`${baseUrl}/messages/notifications/userRead/${senderId}`, {
                isRead: true,  // ส่งข้อมูลที่ต้องการอัปเดต
            });

            console.log('API Response:', response);
            // console.log("✅ Updated notifications in database");

            // อัปเดต state ใน frontend
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => {
                    console.log('notification', notification); // แสดงค่า notification ในแต่ละรอบ
                    return notification.senderId === senderId  // ตรวจสอบว่า id ตรงกับ notification.id
                        ? { ...notification, isRead: true } // ถ้า id ตรง ให้เปลี่ยนสถานะเป็น "อ่านแล้ว"
                        : notification;
                })
            );

            // ลบการแจ้งเตือนที่ยังไม่ได้อ่านจาก unreadNotifications
            setUnreadNotifications((prevUnread) =>
                prevUnread.filter((notification) => notification.senderId !== senderId)
            );

             // 🔄 แจ้งเตือนผ่าน Socket.io (ย้ายไป Server)
        socket.emit("notificationRead", { senderId, recipientId: user._id,});
        } catch (error) {
            console.error("❌ Error updating notifications:", error);
        }
    };

    const markMessageAsRead = async (senderId, isRead) => {
        if (!senderId || isRead || senderId === user._id) {
            console.log("Skipping update for:", { senderId, isRead, userId: user._id });
            return; // ถ้าข้อความถูกอ่านแล้ว หรือ senderId เหมือน user._id จะไม่อัปเดต
        }
        try {

            console.log("🔄 Sending request to mark message as read", { senderId });

            // ส่งการอัปเดตสถานะการอ่านไปที่ Server
            const response = await patchRequest(`${baseUrl}/messages/read/${senderId}`, { isRead: true });

            console.log("📩 API Response:", response); // ดูค่าตอบกลับจาก API

            if (response) {
                // ✅ ส่งค่าที่ได้จาก server (response) ไปที่ Socket
                socket.emit("markAsRead", {
                    recipientId: user._id,
                    senderId,
                    updatedMessages: response // ส่ง response ที่ได้จาก API ไปที่ Server
                });

                console.log("📩 Sent to server:", {
                    recipientId: user._id,
                    senderId,
                    updatedMessages: response
                });
            } else {
                console.warn("⚠ Failed to update message read status", response);
            }
        } catch (error) {
            console.error("❌ Error marking message as read:", error);
        }
    };


    ///////////////////////
    const createChat = useCallback(
        async (studentId, teacherId) => {
            const response = await postRequest(`${baseUrl}/chats`, {
                studentId,
                teacherId,
            });

            if (response.error) {
                return console.error("Error creating chat:", response);
            }
            setUserChats((prev) => [...prev, response]);
        }, []);
    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatError,
                potentialChats,
                createChat,
                updateCurrentChat,
                currentChat,
                messages,
                isMessagesLoading,
                messagesError,
                sendTextMessage,
                onlineUsers,
                notifications,
                allUsers,
                setNotifications,
                setUnreadNotifications,
                unreadNotifications,
                setNotificationsAsRead,
                newMessage,
                setCurrentChat,
                markMessageAsRead,
                unreadChatsCount,
                socket
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};




