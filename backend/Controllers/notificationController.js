const Notification = require("../Models/notificationModel");
const User = require("../Models/userModel");
const Quiz = require("../Models/quiz"); // เพิ่มการเชื่อมกับ Quiz

// 📌 ฟังก์ชันส่งแจ้งเตือน
exports.sendNotification = async (type, title, itemId, role, io) => {
  try {
    if (!io || !["student", "teacher"].includes(role) || !itemId) return;
    if (!["student", "teacher"].includes(role) || !itemId) return;

    // ดึง User ที่ยังไม่ถูกลบ และตรงกับ Role
    const users = await User.find({ role, deleted_at: null }, "_id");

    if (!users?.length) return;

    const notificationTypes = {
      quiz_add: { link: role === "student" ? `/Quiz/${itemId}` : `/quiz-teacher/${itemId}`, message: `📝 มีแบบทดสอบใหม่: ${title}` },
      quiz_update: { link: role === "student" ? `/Quiz/${itemId}` : `/quiz-teacher/${itemId}`, message: `📢 มีการอัปเดตแบบทดสอบ: ${title}` },
      lesson_add: { link: role === "student" ? `/getAnimation3DById/${itemId}` : `/getAnimation3DById/${itemId}`, message: `📚 มีบทเรียนใหม่: ${title}` },
      lesson_update: { link: role === "student" ? `/Lesson/${itemId}` : `/lesson-teacher/${itemId}`, message: `📢 มีการอัปเดตบทเรียน: ${title}` },
    };

    const { link, message } = notificationTypes[type] || {};
    if (!link || !message) {
      console.error("❌ Unknown notification type:", type);
      return;
    }

    // ใช้ bulkWrite เพื่อเพิ่มประสิทธิภาพ
    const notificationsToInsert = users.map((user) => ({
      updateOne: {
        filter: { recipient: user._id, type, message, link, isRead: false },
        update: {
          message,
          type,
          link,
          isRead: false,
          recipient: user._id,
          userRole: role,
          createdAt: new Date(),
        },
        upsert: true,
        setDefaultsOnInsert: true
      }
    }));

    await Notification.bulkWrite(notificationsToInsert);

    // ส่งแจ้งเตือนแบบเรียลไทม์
    users.forEach((user) => {
      io.to(user?._id.toString()).emit("newNotification", { message, link });
    });

  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

// // 📌 แจ้งเตือนเมื่ออัปเดต Quiz
// exports.notificationQuizUpdate = async (quizTitle, quizId, role, io) => {
//   try {
//     if (!quizId || !quizTitle) return;

//     const type = "quiz_update";
//     const link = role === "student" ? `/Quiz/${quizId}` : `/quiz-teacher/${quizId}`;
//     const message = `📢 มีการอัปเดตแบบทดสอบ: ${quizTitle}`;

//     const users = await User.find({ role, deleted_at: null }, "_id");

//     if (!users?.length) return;

//     const notifications = users.map((user) => ({
//       updateOne: {
//         filter: { recipient: user._id, type, message, link },
//         update: {
//           message,
//           type,
//           link,
//           isRead: false,
//           recipient: user._id,
//           userRole: role,
//           relatedQuiz: quizId,
//           createdAt: new Date(),
//         },
//         upsert: true,
//         setDefaultsOnInsert: true
//       }
//     }));

//     await Notification.bulkWrite(notifications);

//     users.forEach((user) => {
//       io.to(user?._id.toString()).emit("newNotification", { message, link });
//     });

//   } catch (error) {
//     console.error("❌ Error sending quiz notification:", error);
//   }
// };

// 📌 ลบแจ้งเตือนที่เกี่ยวข้องกับ User
exports.deleteUserNotifications = async (userId) => {
  try {
    await Notification.deleteMany({ recipient: userId });
  } catch (error) {
    console.error("❌ Error deleting user notifications:", error);
  }
};

// 📌 ลบแจ้งเตือนที่เกี่ยวข้องกับ Quiz
exports.deleteQuizNotifications = async (quizId) => {
  try {
    await Notification.deleteMany({ relatedQuiz: quizId });
  } catch (error) {
    console.error("❌ Error deleting quiz notifications:", error);
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("❌ Error fetching user notifications:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงแจ้งเตือน" });
  }
};


// 📌 อัปเดตการแจ้งเตือนเป็น "อ่านแล้ว"
exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds?.length) {
      return res.status(400).json({ message: "ไม่พบ ID ของแจ้งเตือน" });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isRead: true }  }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({ message: "ไม่มีการแจ้งเตือนที่สามารถอัปเดตได้" });
    }

    res.json({ message: "อัปเดตสถานะการอ่านเรียบร้อย" });
  } catch (error) {
    console.error("❌ Error in markAsRead:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะแจ้งเตือน" });
  }
};

// 📌 ลบแจ้งเตือน
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    //   return res.status(400).json({ message: "ID แจ้งเตือนไม่ถูกต้อง" });
    // }

    if (!notificationId) {
      return res.status(400).json({ message: "ไม่พบ ID ของแจ้งเตือน" });
    }

    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({ message: "ไม่พบการแจ้งเตือนที่ต้องการลบ" });
    }

    res.json({ message: "ลบแจ้งเตือนเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแจ้งเตือน" });
  }
};
