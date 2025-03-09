const mongoose = require("mongoose");

const AnimationSchema = new mongoose.Schema({
    Ani_name: {
      type: String,
      required: true,
      
    },
    Ani_animation: {
      name: String ,  
      data: Buffer,
      contentType: String,
      size: Number
    },
    Ani_image: {
      name: String ,  
      data: Buffer,
      contentType: String,
      size: Number
    },
    Ani_description: {
      type: String,
        required: true, 
      },
      createdAt: {
        type: Date,
        default: Date.now, // กำหนด default ให้เป็นวันที่สร้าง
      },
  });

// สร้าง Index สำหรับฟิลด์ที่ต้องการ
AnimationSchema.index({ Ani_name: 1 });
AnimationSchema.index({ createdAt: -1 });
const animationModel = mongoose.model("Animation", AnimationSchema);

module.exports =  animationModel;
