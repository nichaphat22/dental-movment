import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

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


    console.log("notifications", notifications)

    //socket
     // เชื่อมต่อ Socket
     useEffect(() => {
        const newSocket = io("http://localhost:8800");
        setSocket(newSocket);
    
        newSocket.on('connect', () => {
            console.log("Socket connected:", newSocket.id); // ตรวจสอบว่า socket เชื่อมต่อแล้ว
        });
    
        return () => {
            newSocket.disconnect();
        };
    }, [user]);
    

    useEffect(() => {
        if (socket && newMessage && currentChat && user?._id) {
            // ตรวจสอบค่าของ currentChat และ user._id
            const recipientId = currentChat.members?.find((id) => id !== user._id);
            if (!recipientId) {
                console.error("Recipient not found for chat:", currentChat);
                return;  // หาก recipientId เป็น undefined ให้หยุดการส่งข้อความ
            }
    
            console.log("Sending message to recipient:", recipientId);
            socket.emit("sendMessage", { ...newMessage, recipientId });
        } else {
            console.log("Missing values:", { socket, newMessage, currentChat, user });
        }
    }, [socket, newMessage, currentChat, user]);
    
    // ส่ง userId เมื่อเชื่อมต่อ
    useEffect(() => {
        if (socket === null || !user?._id) return;

        console.log("Adding user to socket:", user._id);
        socket.emit("addNewUser", user._id);
    }, [socket, user]);

  
    useEffect(() => {
        if (socket === null) return;
    
        socket.on("getMessage", (message) => {
            console.log("New message received:", message);
    
            setMessages((prevMessages) => {
                return Array.isArray(prevMessages) ? [...prevMessages, message] : [message];
            });
        });
    
        socket.on("getNotification", (notification) => {
            console.log("Notification received:", notification);
    
            if (notification.senderId === user._id) return;
    
            // เก็บการแจ้งเตือนที่ยังไม่ได้อ่านใน localStorage
            setNotifications((prevNotifications) => {
                const updatedNotifications = [...prevNotifications, notification];
                console.log("Updated notifications:", updatedNotifications);
    
                // เก็บข้อมูลการแจ้งเตือนที่ยังไม่ได้อ่านใน localStorage
                localStorage.setItem("unreadNotifications", JSON.stringify(updatedNotifications));
    
                return updatedNotifications;
            });
        });
    
        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        };
    }, [socket, user]);
    
    
    

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

        const recipientId = currentChat?.members?.find((id) => id !== sender?._id);
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

            // อัปเดตข้อความใหม่และการแจ้งเตือน
            setMessages((prevMessages) => [
                ...prevMessages, 
                response.message // ข้อความที่ส่งกลับจาก API
            ]);

            // ส่งข้อความผ่าน Socket
            if (socket && socket.connected) {
                socket.emit("sendMessage", { ...response.message, recipientId });

            }

            // อัปเดตการแจ้งเตือน
            if (response.notification) {
                setNotifications((prevNotifications) => [
                    ...prevNotifications, 
                    response.notification // การแจ้งเตือนที่ส่งกลับจาก API
                ]);
            }

        } catch (error) {
            console.error("Error sending message:", error);
        }
    },
    [currentChat, socket]
);

    
    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    
    
    useEffect(() => {
        console.log("Updated messages:", messages);
    }, [messages]);
    

    
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
                setNotifications
                // markAllNotificationsAsRead,
                // markNotificationsAsRead,
                // markThisUserNotificationsAsRead,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};




