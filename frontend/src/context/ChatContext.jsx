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

    console.log("notifications", notifications)

    //socket
     // Initialize socket connection
     useEffect(() => {
        const newSocket = io("http://localhost:8800");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Fetch online users and handle socket events
    useEffect(() => {
        if (socket === null) return;

        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket, user]);

    // send message
    useEffect(() => {
        if (socket === null) return;
        const recipientId = currentChat?.members?.find((id) => id !== user?._id)
        socket.emit("sendMessage", { ...newMessage, recipientId })
    }, [newMessage]);

  // receive message
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
        if (currentChat?._id !== res.chatId) return;
        setMessages((prev) => [...prev, res]);
    
    })

    socket.on("getNotification", (res) => {
        const isChatOpen = currentChat?.members.some(id => id === res.senderId)
        if (isChatOpen) {
            setNotifications(prev => [{ ...res, isRead: true }, ...prev]);
        } else {
            setNotifications(prev => [res, ...prev]);
        }
    
    });


    return () => {
        socket.off("getMessage");
        socket.off("getNotification");
    };
}, [socket, currentChat]);

    

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
}, [user, notifications]);
    

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);

            try {
                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

                if (response.error) {
                    setMessagesError(response);
                    return;
                }

                setMessages(response);
            } catch (error) {
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
        async (textMessage, sender, currentChatId, fileMessage,setTextMessage,setFileMessage) => {
            if (!textMessage && !fileMessage) {
                console.log("You must type something...");
                return;
            }
    
            try {
                const response = await postRequest(`${baseUrl}/messages`, {
                    chatId: currentChatId,
                    senderId: sender._id,
                    text: textMessage,
                    file: fileMessage,
                },[fileMessage]);
                console.log(response); // Log the response for debugging
                if (response.error) {
                    return setSendTextMessageError(response);
                }
    
                setNewMessage(response); // Assuming setNewMessage updates your message state
                setMessages((prev) => [...prev, response]); // Assuming setMessages updates your messages state
                setTextMessage(""); // Reset text message after sending
                setFileMessage(null); // Reset file message after sending
               
            } catch (error) {
                console.error("Error sending message:", error);
                setSendTextMessageError(error);
            }
        },
        []
    );
    


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

            const markAllNotificationsAsRead = useCallback((notifications) => {
                const mNotifications = notifications.map((n)=>{
                    return { ...n, isRead: true}
                });
                setNotifications(mNotifications);
            },[]);
        
            const markNotificationsAsRead = useCallback(
                (n, userChats, user, notifications)=> {
                    // find chat to open
        
                    const desiredChat = userChats.find((chat)=>{
                        const chatMembers = [user._id, n.senderId];
                        const isDesiredChat = chat?.members.every((member)=>{
                            return chatMembers.includes(member);
                        })
                        return isDesiredChat
                    })
                    // mark notification as read
                    const mNotifications = notifications.map(el =>{
                        if(n.senderId === el.senderId){
                            return {...n, isRead:true}
                        } else {
                            return el
                        }
                    })
                    updateCurrentChat(desiredChat);
                    setNotifications(mNotifications);
                },[]);
        
            const markThisUserNotificationsAsRead = useCallback(
                (thisUserNotifications, notifications) => {
                    // mark notification as read
                     const mNotifications = notifications.map(el =>{
                        let notification;
        
                        thisUserNotifications.forEach((n) => {
                            if(n.senderId === el.senderId){
                                notification = {...n, isRead:true}
                            } else {
                                notification = el
                            }
                        })
                        return notification;
                    })
                    setNotifications(mNotifications);
                },[])
        
        

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
                markAllNotificationsAsRead,
                markNotificationsAsRead,
                markThisUserNotificationsAsRead,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};




