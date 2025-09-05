const mongoose = require("mongoose");

const Animation3DSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    animationFile: {
      name: String ,  
      path: { type: String, required: true },   
      mimetype: { type: String },
      size: { type: Number }, // ไบต์
      duration: { type: Number },
    },
    imageFile: {
      name: String ,  
      path: { type: String, required: true },   
      mimetype: { type: String },
      size: { type: Number }, // ไบต์

    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animation3D", Animation3DSchema);
