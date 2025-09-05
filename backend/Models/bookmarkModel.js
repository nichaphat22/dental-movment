// models/Bookmark.js
const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Model3D",
  }],
});

module.exports = mongoose.model("Bookmark", bookmarkSchema);
