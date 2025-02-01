const express = require("express")
const { 
    createMessage, 
    getUnreadNotifications,
    getMessages,updateNotificationsToRead} = require("../Controllers/messageController")
const router = express.Router();

router.post("/", createMessage);
router.get("/:chatId", getMessages);

router.get('/notifications/unread/:recipientId', getUnreadNotifications);
router.patch('/notifications/read/:recipientId', updateNotificationsToRead);
module.exports = router;