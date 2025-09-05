const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },
    relatedQuiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: 1}, { expireAfterSeconds: 60 * 60 * 24 * 30});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
