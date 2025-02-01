import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { BsChatTextFill } from "react-icons/bs";
import NotiChat from "./NotiChat";
import moment from "moment/min/moment-with-locales";

moment.locale("th");

const Notifications = () => {
  const { user } = useContext(AuthContext);  // Context to get the current user data
  const [isOpen, setIsOpen] = useState(false); // State to control visibility of the notification box
  // Access context data for notifications
  const { userChats, updateNotifications, setNotifications, notifications, updateCurrentChat } = useContext(ChatContext);
  const [unreadCount, setUnreadCount] = useState(0);
  // Reset CurrentChat when Notifications component is unmounted
    // Reset CurrentChat when Notifications component is unmounted
    useEffect(() => {
      return () => {
        updateCurrentChat(null);  // Reset current chat when component unmounts
      };
    }, [updateCurrentChat]);
  
    const handleNotificationsClick = () => {
      setIsOpen(!isOpen);  // Toggle the visibility of the notification box
      // notifications.length(0)
      setNotifications([]);
    };
  
  return (
    <div className="notifications">
      <div
        className="notifications-icon"
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          color: "rgb(169, 85, 247)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(241, 241, 241, 0.7)",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleNotificationsClick}
      >
        <BsChatTextFill size={20} />
        {notifications.length > 0 &&  (
          <div
            className="unread-count"
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "5px",
              fontSize: "12px",
            }}
          >
            {notifications.length}  {/* Show the unread notification count */}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="notifications-box" onClick={() => setIsOpen(false)}>
          <div className="notifications-header">
            <h3 style={{ color: "#000", textAlign: "center" }}>แชท</h3>
          </div>

          {userChats?.length > 0 ? (
            <Stack className="messages-box flex-grow-0" gap={3}>
              {userChats.map((chat) => (
                <div key={chat._id} onClick={() => updateCurrentChat(chat)}>
                  <NotiChat chat={chat} user={user} />
                </div>
              ))}
            </Stack>
          ) : (
            <p>No chats available</p>  // If no chats are available
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
