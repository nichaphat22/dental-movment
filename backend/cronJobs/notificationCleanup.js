const cron = require("node-cron");
const Notification = require("../Models/notificationModel");

cron.schedule("0 2 * * *", async () => {
  try {
    const days = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`🧹 ลบแจ้งเตือนเก่ากว่า ${days} วัน จำนวน: ${result.deletedCount}`);
    
  } catch (error) {
    console.error("❌ Error running notification cleanup:", error);
  }
})