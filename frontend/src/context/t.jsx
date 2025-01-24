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
    useEffect(() => {
        const newSocket = io("http://localhost:8800");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // add online user
    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res)
        });
    }, [socket]);

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
        });

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some(id => id === res.senderId)

            if (isChatOpen) {
                setNotifications(prev => [{ ...res, isRead: true }, ...prev])
            } else {
                setNotifications((prev) => [res, ...prev]);
            }
        });

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        }
    }, [socket, currentChat]);
    


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
                        return chat.members.includes(teacher._id);
                    });
                }
                return !isChatCreated;
            });
    
            setPotentialChats(pChats);
        };
    
        getUsers();
    }, [userChats]);
    
    

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id){
            setIsUserChatsLoading(true);
            setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatsLoading(false);

                if (response.error) {
                    return setUserChatsError(response);
                }
                setUserChats(response);
            }
        }
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
        async (textMessage, sender, currentChatId, setTextMessage) => {
            if (!textMessage) {
                console.log("You must type something...");
                return;
            }

            try {
                const response = await postRequest(`${baseUrl}/messages`,({
                    chatId: currentChatId,
                    senderId: sender._id,
                    text: textMessage,
                }));

                if (response.error) {
                    return setSendTextMessageError(response);

                }

                setNewMessage(response);
                setMessages((prev) => [...prev, response]);
                setTextMessage("");
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
