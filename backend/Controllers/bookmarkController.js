const mongoose = require('mongoose'); // ✅ เพิ่มบรรทัดนี้
const bookmarkModel = require('../Models/bookmarkModel');

// ฟังก์ชันสำหรับดึงข้อมูล bookmarks ของผู้ใช้
const getBookmarks = async (req, res) => {
  const { userId } = req.params;

  try {
    const bookmark = await bookmarkModel.findOne({ userId });
    if (bookmark && bookmark.bookmarks) {
      res.json(bookmark.bookmarks);
    } else {
      res.json({}); // Ensure the bookmarks key is always present
    }
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateBookmarks = async (req, res) => {
  const { userId, bookmarks } = req.body;

  if (!userId || !bookmarks) {
    return res.status(400).json({ error: "User ID and bookmarks are required" });
  }

  console.log("Received userId:", userId);
  console.log("Received bookmarks:", bookmarks);

  try {
    const updated = await bookmarkModel.findOneAndUpdate(
      { userId: userId }, // ค้นหาผู้ใช้โดยใช้ userId
      { bookmarks: bookmarks }, // อัปเดต bookmarks
      { new: true, upsert: true } // ใช้ upsert: true เพื่อเพิ่มข้อมูลใหม่ถ้าข้อมูลไม่พบ
    );

    return res.json(updated); // ส่งข้อมูลที่อัปเดตกลับ
  } catch (error) {
    console.error("Error updating bookmarks:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
const removeBookmark = async (req, res) => {
  const { userId, modelId } = req.params;

  try {
    // Query by userId
    const user = await bookmarkModel.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the bookmarks to see its structure
    console.log('User bookmarks:', user.bookmarks);

    // Remove the model from the Map
    if (user.bookmarks.has(modelId)) {
      user.bookmarks.delete(modelId);
      await user.save();
      res.status(200).json({ message: `${modelId} has been removed from bookmarks` });
    } else {
      res.status(404).json({ error: 'Model not found in bookmarks' });
    }
  } catch (error) {
    console.error("Error removing model from bookmarks:", error);
    res.status(500).json({ error: "Failed to remove model from bookmarks" });
  }
};


module.exports = { getBookmarks, updateBookmarks,removeBookmark };
