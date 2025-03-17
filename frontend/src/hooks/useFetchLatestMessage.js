import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";

export const useFetchLatestMessage = (chat) => {
    const { newMessage, notifications } = useContext(ChatContext);
    const [latestMessage, setLatestMessage] = useState();

    useEffect(() => {
        const getMessages = async () => {
            if (!chat?._id) {
                return;
            }

            try {
                // Sending GET request to fetch messages for the given chat
                const response = await axios.get(`http://localhost:8080/api/messages/${chat._id}`);

                // Check if there's an error in the response
                if (response?.data?.error) {
                    console.log("error getting message...", response.data.error);
                    return;
                }

                // Assuming messages are in response.data and are ordered by timestamp
                const lastMessage = response.data[response.data.length - 1]; // Access messages from response.data

                // Update the latestMessage state with the last message
                setLatestMessage(lastMessage);
            } catch (error) {
                console.log("Error getting messages...", error);
            }
        };

        getMessages();
    }, [newMessage, notifications, chat?._id]); // useEffect depends on newMessage, notifications, and chat._id

    return { latestMessage };
};
