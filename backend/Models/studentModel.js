const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentID: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const studentModel = mongoose.model("Student", studentSchema);

module.exports = studentModel;
