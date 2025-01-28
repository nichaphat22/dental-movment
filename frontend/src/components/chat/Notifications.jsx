import { Stack } from "react-bootstrap"; 
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";
import { BsChatTextFill } from "react-icons/bs";
import { unreadNotificationsFunc } from "../../utils/unreadNotificationsFunc";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import NotiChat from "./NotiChat";
import moment from 'moment/min/moment-with-locales'; // Correct import statement
moment.locale("th"); // Set moment to Thai globally

const Notifications = ({chat}) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
  
    // Fetch recipient user
    const { recipientUser } = useFetchRecipientUser(chat, user);
    // console.log("Fetched recipientUser:", recipientUser);
  
    // Fetch notifications from ChatContext
    const { userChats, notifications, updateCurrentChat, } = useContext(ChatContext);


    const handleNotificationsClick = () => {
        setIsOpen(!isOpen);
        
    };
    
    

    useEffect(() => {
        return () => {
            updateCurrentChat(null);
        };
    }, [updateCurrentChat]);


const unreadCount = notifications.filter(notification => !notification.isRead).length;

return (
    <div className="notifications">
        <div className="notifications-icon" style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            color: 'rgb(169, 85, 247)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(241, 241, 241, 0.7)',
            border: 'none',
            cursor: 'pointer',
        }} onClick={handleNotificationsClick}>
            <BsChatTextFill size={20} />
            {unreadCount > 0 && (
                <div className="unread-count" style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '5px',
                    fontSize: '12px',
                }}>
                    {unreadCount}
                </div>
            )}
        </div>

        {isOpen && (
            <div className="notifications-box" onClick={() => {
                setIsOpen(false);
            }}>
                <div className="notifications-header">
                    <h3 style={{ color: '#000', textAlign: 'center' }}>แชท</h3>
                </div>

                {userChats?.length > 0 ? (
                    <Stack className="messages-box flex-grow-0" gap={3}>
                        {userChats.map((chat, index) => {
                            return (
                                <div key={index} onClick={() => updateCurrentChat(chat)}>
                                    <NotiChat chat={chat} user={user} />
                                </div>
                            );
                        })}
                    </Stack>
                ) : null}
            </div>
        )}
    </div>
);

};

export default Notifications;
