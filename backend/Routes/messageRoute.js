const express = require("express")
const { 
    createMessage, 
    getUnreadNotifications,
    getMessages,updateNotificationsToRead,notificationUserRead,markMessageAsRead,notificationDeleteUserRead } = require("../Controllers/messageController")
const router = express.Router();

router.post("/", createMessage);
router.get("/:chatId", getMessages);
router.patch('/read/:senderId', markMessageAsRead);

router.get('/notifications/unread/:recipientId', getUnreadNotifications);
router.patch('/notifications/read/:recipientId', updateNotificationsToRead);
router.put('/notifications/userRead/:senderId', notificationUserRead);
router.delete('/notifications/DeleteUserRead/:recipientId', notificationDeleteUserRead);
module.exports = router;