// import { useContext, useState, useEffect } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import { ChatContext } from "../../context/ChatContext";
// import { unreadNotificationsFunc } from "../../utils/unreadNotificationsFunc";
// import moment from "moment";

// const Notifications = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const { user } = useContext(AuthContext);
//     const {
//         notifications,
//         userChats,
//         allUsers,
//         markAllNotificationsAsRead,
//         markNotificationsAsRead,
//     } = useContext(ChatContext);

//     const unreadNotifications = unreadNotificationsFunc(notifications);
//     const modifiedNotifications = notifications.map((n) => {
//         const sender = allUsers.find((user) => user._id === n.senderId);
//         return {
//             ...n,
//             senderName: sender?.fname,
//         };
//     });

//     useEffect(() => {
//         console.log("Notifications updated:", notifications);
//     }, [notifications]);

//     return (
//         <div className="notifications">
//             <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
//                 <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="22"
//                     height="22"
//                     fill="currentColor"
//                     className="bi bi-chat-right-text"
//                     viewBox="0 0 16 16"
//                 >
//                     <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
//                     <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
//                 </svg>
//                 {unreadNotifications?.length === 0 ? null : (
//                     <span className="notification-count">
//                         <span>{unreadNotifications?.length}</span>
//                     </span>
//                 )}
//             </div>
//             {isOpen ? (
//                 <div className="notifications-box">
//                     <div className="notifications-header">
//                         <h3>Notifications</h3>
//                         <div className="mark-as-read" onClick={() => markAllNotificationsAsRead(notifications)}>
//                             Mark all as read
//                         </div>
//                     </div>
//                     {modifiedNotifications?.length === 0 ? (
//                         <span className="notification">No notification yet...</span>
//                     ) : null}
//                     {modifiedNotifications &&
//                         modifiedNotifications.map((n, index) => (
//                             <div
//                                 key={index}
//                                 className={n.isRead ? "notification" : "notification not-read"}
//                                 onClick={() => {
//                                     markNotificationsAsRead(n, userChats, user, notifications);
//                                     setIsOpen(false);
//                                 }}
//                             >
//                                 <span>{`${n.senderName} sent you a new message`}</span>
//                                 <span className="notification-time">{moment(n.date).calendar()}</span>
//                             </div>
//                         ))}
//                 </div>
//             ) : null}
//         </div>
//     );
// };

// export default Notifications;
