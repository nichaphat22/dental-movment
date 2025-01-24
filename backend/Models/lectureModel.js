const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    userLectureID: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
      ref: 'User', // Assuming there's a User model
      required: true
  },
    img: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const lectureModel = mongoose.model("Lecture", lectureSchema);

module.exports = lectureModel;
