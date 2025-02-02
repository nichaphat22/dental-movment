import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest, patchRequest } from "../utils/services";
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
    const [unreadCount, setUnreadCount] = useState(0);
    
    // const { recipientUser } = useFetchRecipientUser(currentChat, user);

    // console.log(/"currentChat", currentChat)

    //socket
     // เชื่อมต่อ Socket
    // เชื่อมต่อ Socket
    useEffect(() => {
        const newSocket = io("http://localhost:8800");
    
        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id); // ตรวจสอบว่าการเชื่อมต่อสำเร็จ
            setSocket(newSocket);
            // console.log("setSocket:", setSocket);
            // เมื่อเชื่อมต่อสำเร็จแล้ว เพิ่ม userId
            if (user?._id) {
                newSocket.emit("addNewUser", user._id); // ส่ง userId ไปที่เซิร์ฟเวอร์
                console.log("Adding user to socket:", user._id);
            }
        });
    
        newSocket.on("disconnect", () => {
            console.log("Socket disconnected:", newSocket.id);
        });
    
        return () => {
            newSocket.disconnect();
        };
    }, [user]); // เพิ่ม `user` เป็น dependency
    
    
    
 
// ส่ง userId เมื่อเชื่อมต่อ
useEffect(() => {
    if (socket && user?._id) {
        console.log("Adding user to socket:", user._id);
        socket.emit("addNewUser", user._id);  // ส่ง userId ไปที่เซิร์ฟเวอร์
    }
}, [user, socket]);  // เพิ่ม socket ใน dependencies เพื่อให้มั่นใจว่า `socket` ถูกกำหนดค่าแล้ว

// รับข้อความและการแจ้งเตือน
useEffect(() => {
    if (socket === null) {
        console.log("Socket is not connected yet");
        return; // หยุดการทำงานถ้ายังไม่มีการเชื่อมต่อ socket
    }

    socket.on("getMessage", (message) => {
        console.log("New message received:", message);

        setMessages((prevMessages) => {
            return Array.isArray(prevMessages) ? [...prevMessages, message] : [message];
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
    });


    return () => {
        socket.off("getMessage");
        socket.off("getNotification");
        // socket.off("newNotification");
    };
}, [socket, user]);  // ใช้ socket และ user เป็น dependencies

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
                    return chat.members[0]===teacher._id || chat.members[1] === teacher._id;
                });
            }
            return !isChatCreated;
        });

        setPotentialChats(pChats);
    };

    getUsers();
}, [userChats, user]);

// Fetch user chats and latest messages
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

            // Fetch latest message for each chat
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

            // Sort chats by latest message timestamp (assuming createdAt field exists in lastMessage)
            const sortedChats = chatsWithLatestMessage.sort((a, b) => {
                if (!a.latestMessage) return -1;
                if (!b.latestMessage) return 1;
                return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
            });

            setUserChats(sortedChats);
        } catch (error) {
            setIsUserChatsLoading(false);
            setUserChatsError(error);
        }
    };

    getUserChats();
}, [user]);
    

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
  
      const recipientId = currentChat?.members?.filter((id) => id !== sender?._id)[0];
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
        setMessages((prevMessages) => [
          ...prevMessages, 
          response.message
        ]);
        setTextMessage("");  // Clear the text input
        setFileMessage(null);  // Clear the file input
  
        // ส่งข้อความผ่าน Socket
        if (socket && socket.connected) {
          socket.emit("sendMessage", { ...response.message, recipientId });

    // ส่งการแจ้งเตือนให้กับผู้รับ
    socket.emit("getNotification", { ...response.notification });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [currentChat, socket]
);

  
//   const markNotificationsAsRead = async () => {
//     const recipientId = currentChat?.members?.filter((id) => id !== user._id)[0];

//     if (!recipientId) {
//       console.log("No recipient found for notifications");
//       return;
//     }

//     try {
//       // เรียก API เพื่อเปลี่ยนสถานะการแจ้งเตือนเป็น "อ่านแล้ว"
//       const res = await getRequest(`${baseUrl}/messages/notifications/read/${recipientId}`);
//       if (!res.ok) {
//         throw new Error(`Error: ${res.status}`);
//       }
//       console.log("Notifications marked as read:", res.data);

//       // อัปเดตสถานะการแจ้งเตือนในฝั่ง React
//       setNotifications(res.data);
//       setUnreadCount(0);  // รีเซ็ตจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
//     } catch (err) {
//       console.error("Error marking notifications as read:", err);
//     }
// };


// console.log('unreadcount',unreadCount)

  
    
    useEffect(() => {
        console.log("Updated messages:", messages);
    }, [messages]);
    

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    
    
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
            },[]);
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
                unreadNotifications
                // fetchNotifications,

                // markNotificationsAsRead
                // setUnreadCount,
                // unreadCount,
                // updateNotifications
                // markNotificationsAsReadOnChatView
                // markAllNotificationsAsRead,
                // markNotificationsAsRead,
                // markThisUserNotificationsAsRead,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};




