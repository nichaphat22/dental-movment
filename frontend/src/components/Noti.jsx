import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { unreadNotificationsFunc } from "../utils/unreadNotificationsFunc";

const ChatBox = () => {
    const navigate = useNavigate();
    const { notifications } = useContext(ChatContext);
    const { user } = useContext(AuthContext);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        const unreadCount = unreadNotificationsFunc(notifications).length;
        setUnreadNotifications(unreadCount);
    }, [notifications]);

    const handleButtonClick = () => {
        navigate("/chat"); 
    };

    return (
        <div
            className="chatbox"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
            }}
        >
            <button 
                onClick={handleButtonClick} 
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#379BFF',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative', 
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chat-text-fill" viewBox="0 0 16 16">
                    <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
                </svg>
                {unreadNotifications === 0 ? null : (
                    <span className="notification-count">
                        <span>{unreadNotifications}</span>
                    </span>
                )}
            </button>
        </div>
    );
}

export default ChatBox;