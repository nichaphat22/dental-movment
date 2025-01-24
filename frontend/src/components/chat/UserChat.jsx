import { Stack } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotificationsFunc";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment";

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);
  const { onlineUsers, notifications, markThisUserNotificationsAsRead } = useContext(ChatContext);
  const { latestMessage: initialLatestMessage } = useFetchLatestMessage(chat, user, notifications);

  const [latestMessage, setLatestMessage] = useState(initialLatestMessage);
  const [thisUserNotifications, setThisUserNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Update latest message
    setLatestMessage(initialLatestMessage);
  }, [initialLatestMessage]);

  useEffect(() => {
    // Update this user's notifications
    const unreadNotifications = unreadNotificationsFunc(notifications);
    const userNotifications = unreadNotifications?.filter(n => n.senderId == recipientUser?._id);
    setThisUserNotifications(userNotifications);
  }, [notifications, recipientUser]);

  useEffect(() => {
    setIsOnline(onlineUsers?.some(user => user?.userId === recipientUser?._id));
  }, [onlineUsers, recipientUser]);

  const truncateText = text => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) {
      shortText = shortText + "...";
    }
    return shortText;
  };

  const handleClick = () => {
    if (thisUserNotifications?.length !== 0) {
      markThisUserNotificationsAsRead(thisUserNotifications, notifications);
    }
  };

  return (
    <Stack
      direction="horizontal"
      gap={1}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
      onClick={handleClick}
    >
      <div className="d-flex">
        <div className="me-2">
          <img src={recipientUser?.img} alt="profile"  width="36" height="36" />
        </div>
        <div className="text-content">
          <div className="name" style={{ color: "black" }}>
            {recipientUser?.fname} {recipientUser?.lname}
          </div>
          <div className="text">
            {latestMessage?.text && (
              <span>{truncateText(latestMessage?.text)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">{moment(latestMessage?.createdAt).calendar()}</div>
        <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
          {thisUserNotifications?.length > 0 ? thisUserNotifications.length : ""}
        </div>
        <span className={isOnline ? "user-online" : ""}></span>
      </div>
    </Stack>
  );
};

export default UserChat;
