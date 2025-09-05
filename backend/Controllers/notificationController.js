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
      quiz_add: {
        link:
          role === "student" ? `/Quiz/${itemId}` : `/quiz-teacher/${itemId}`,
        message: `มีแบบทดสอบใหม่: ${title}`,
      },
      quiz_update: {
        link:
          role === "student" ? `/Quiz/${itemId}` : `/quiz-teacher/${itemId}`,
        message: `มีการอัปเดตแบบทดสอบ: ${title}`,
      },
      animation2d_add: {
        link: `/animation/view/${itemId}`,
        message: `Biomechanical Consideration มีบทเรียนใหม่: ${title}`,
      },
      animation2d_update: {
        link: `/animation/view/${itemId}`,
        message: `Biomechanical Consideration มีการอัปเดตบทเรียน: ${title}`,
      },
      animation3d_add: {
        link: `/animation3d/${itemId}/view`,
        message: `การเคลื่อนที่ของฟันเทียม มีบทเรียนใหม่: ${title}`,
      },
      animation3d_update: {
        link: `/animation3d/${itemId}/view`,
        message: `การเคลื่อนที่ของฟันเทียม มีการอัปเดตบทเรียน: ${title}`,
      },
      model_add: {
        link: `/Model/${itemId}/view`,
        message: `RPD Sample Case มีบทเรียนใหม่: ${title}`,
      },
      model_update: {
        link: `/Model/${itemId}/view`,
        message: `RPD Sample Case มีการอัปเดตบทเรียน: ${title}`,
      },
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
        setDefaultsOnInsert: true,
      },
    }));

    await Notification.bulkWrite(notificationsToInsert);

    // จำกัดไม่ให้เกิน 20 แจ้งเตือนต่อ user
    for (const user of users) {
      const count = await Notification.countDocuments({ recipient: user._id });
      if (count > 20) {
        const toDelete = count - 20; // ❗ แก้เป็น 20 จริงๆ (ไม่ใช่ -50)
        await Notification.find({ recipient: user._id })
          .sort({ createdAt: 1 })
          .limit(toDelete)
          .deleteMany();
      }
    }

    // ส่งแจ้งเตือนแบบเรียลไทม์ (ต้องส่งทั้ง document ที่มี _id กลับไป)
    for (const user of users) {
      const newNoti = await Notification.findOne({ recipient: user._id })
        .sort({ createdAt: -1 })
        .lean();

      if (newNoti) {
        io.to(user._id.toString()).emit("newNotification", newNoti);
      }
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

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
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found" });
    }

    const notifications = await Notification.find({
      recipient: req.user.id,
    }).sort({ createdAt: -1 });

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
    console.log("📥 req.body:", req.body);

    if (!notificationIds?.length) {
      return res.status(400).json({ message: "ไม่พบ ID ของแจ้งเตือน" });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isRead: true } }
    );

    if (result.matchedCount === 0) {
      return res
        .status(400)
        .json({ message: "ไม่มีการแจ้งเตือนที่สามารถอัปเดตได้" });
    }

    res.json({ message: "อัปเดตสถานะการอ่านเรียบร้อย" });
  } catch (error) {
    console.error("❌ Error in markAsRead:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะแจ้งเตือน" });
  }
};

// 📌 ลบแจ้งเตือน
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ message: "ไม่พบ ID ของแจ้งเตือน" });
    }

    const deletedNotification = await Notification.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      return res.status(404).json({ message: "ไม่พบการแจ้งเตือนที่ต้องการลบ" });
    }

    res.json({ message: "ลบแจ้งเตือนเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแจ้งเตือน" });
  }
};
