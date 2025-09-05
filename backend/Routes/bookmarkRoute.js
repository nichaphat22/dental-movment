const express = require('express');
const router = express.Router();
const { getBookmarks, updateBookmarks, removeBookmark } = require('../Controllers/bookmarkController');

// API สำหรับดึงข้อมูล bookmarks ของผู้ใช้
router.get('/:userId', getBookmarks);

// API สำหรับอัปเดตข้อมูล bookmarks ของผู้ใช้
router.post('/', updateBookmarks);

router.delete("/remove-bookmark", removeBookmark);

module.exports = router;
