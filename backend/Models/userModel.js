const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // อนุญาตให้มีค่า null ได้
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please provide email"],
    },
    password: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
      default: "student",
    },
    roleData: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "roleRef",
    },
    roleRef: {
      type: String,
      enum: ["Student", "Teacher"], // อนาคตเพิ่ม collection อื่นได้ เช่น 'Student'
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// กรองเอกสารที่ไม่ได้ลบเมื่อทำการ query
userSchema.pre(/^find/, function (next) {
  this.find({ deleted_at: null });
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
