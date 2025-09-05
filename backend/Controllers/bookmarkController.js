const mongoose = require("mongoose");
const bookmarkModel = require("../Models/bookmarkModel");

// ดึง bookmarks ของผู้ใช้
const getBookmarks = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const bookmark = await bookmarkModel.findOne({ userId });
    if (!bookmark) return res.json({ bookmarks: [] });

    const bookmarksAsString = bookmark.bookmarks.map((id) => id.toString());
    res.json({ bookmarks: bookmarksAsString });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Toggle bookmark
const updateBookmarks = async (req, res) => {
  try {
    const { userId, modelId } = req.body;

    if (!userId || !modelId) {
      return res
        .status(400)
        .json({ message: "userId and modelId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(modelId)
    ) {
      return res.status(400).json({ message: "Invalid userId or modelId" });
    }

    let bookmark = await bookmarkModel.findOne({ userId });

    if (!bookmark) {
      // สร้างใหม่พร้อมแปลง userId และ modelId เป็น ObjectId
      bookmark = new bookmarkModel({ 
        userId, 
        bookmarks: [modelId] ,
      });
    } else {
      const exists = bookmark.bookmarks.some(
        (id) => id.toString() === modelId
      );
      if (exists) {
        bookmark.bookmarks = bookmark.bookmarks.filter(
          (id) => id.toString() !== modelId
        );
      } else {
        bookmark.bookmarks.push(modelId);
      }
    }

    // บันทึก bookmark ทุกครั้งหลังแก้ไข
    await bookmark.save();

    // ส่งกลับเป็น string array
    const bookmarksAsString = bookmark.bookmarks.map((id) => id.toString());
    res.status(200).json({ bookmarks: bookmarksAsString });
  } catch (error) {
    console.error("Error updating bookmarks:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ลบ bookmark (option)
const removeBookmark = async (req, res) => {
  const { userId, modelId } = req.body;
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(modelId)
  ) {
    return res.status(400).json({ error: "Invalid userId or modelId" });
  }

  try {
    const bookmark = await bookmarkModel.findOne({ userId });
    if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });

    bookmark.bookmarks = bookmark.bookmarks.filter(
      (id) => id.toString() !== modelId
    );
    await bookmark.save();

    res.status(200).json({ bookmarks: bookmark.bookmarks.map((id) => id.toString()) });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return res.status(500).json({ error: "Failed to remove bookmark" });
  }
};

module.exports = { getBookmarks, updateBookmarks, removeBookmark };
