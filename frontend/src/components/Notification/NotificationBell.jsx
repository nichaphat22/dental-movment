// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setNotifications,
//   addNotification,
//   markAsReadReducer,
//   deleteNotificationReducer,
// } from "../../redux/notificationSlice";
// import { FaBell, FaTrash } from "react-icons/fa";
// import io from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import {
//   getNotifications,
//   markNotificationAsRead,
//   deleteNotification as deleteNotificationAPI,
// } from "../../utils/notificationAPI";

// // ตั้งค่า WebSocket
// const socket = io("http://localhost:8800");
// function NotificationBell() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { list, unreadCount } = useSelector((state) => state.notifications);

//   useEffect(() => {
//     getNotifications()
//       .then((data) => dispatch(setNotifications(data)))
//       .catch((error) => console.error("Error loading notifications:", error));

//     socket.on("newNotification", (notification) => {
//       if (notification.type === "quiz_added") {
//         toast.success(`📢 ${notification.message}`, { autoClose: 3000 });
//       } else {
//         toast.info(notification.message);
//       }
//       dispatch(addNotification(notification));
//     });

//     return () => socket.off("newNotification");
//   }, [dispatch]);

//   const handleRead = async (id, link) => {
//     try {
//       await markNotificationAsRead(id);
//       dispatch(markAsReadReducer(id));
//       navigate(link);
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteNotificationAPI(id);
//       dispatch(deleteNotificationReducer(id));
//     } catch (error) {
//       console.error("Error deleting notification:", error);
//     }
//   };

//   return (
//     <div className="relative">
//       {/* <FaBell
//         size={30}
//         onClick={() => list.forEach((n) => dispatch(markAsReadReducer(n._id)))}
//         className="cursor-pointer"
//       /> */}
//       {unreadCount > 0 && (
//         <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white rounded-full px-2 text-xs">
//           {unreadCount}
//         </span>
//       )}
//       <div className="top-10 right-0 bg-white border border-gray-300 w-[350px] max-h-full overflow-y-auto shadow-lg z-10">
//         {list.length === 0 ? (
//           <p className="text-center p-3 text-gray-500">ไม่มีการแจ้งเตือน</p>
//         ) : (
//           list.map((n) => (
//             <div key={n._id} className="p-3 border-b border-gray-200 flex justify-between items-center">
//               <p onClick={() => handleRead(n._id, n.link)} className="cursor-pointer text-sm hover:text-blue-500">
//                 {n.message}
//               </p>
//               <FaTrash onClick={() => handleDelete(n._id)} className="text-red-500 cursor-pointer" />
//             </div>
//           ))
//         )}
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }

// export default NotificationBell;
