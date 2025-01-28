const mongoose = require("mongoose");

const AnimationSchema = new mongoose.Schema({
    Ani_name: {
      type: String,
      required: true,
    },
    Ani_animation: {
      data: Buffer,
      contentType: String,
      size: Number
    },
    Ani_image: {
      data: Buffer,
      contentType: String,
      size: Number
    },
    Ani_description: {
      type: String,
        required: true, 
      },
  });
  
const animationModel = mongoose.model("Animation", AnimationSchema);

module.exports =  animationModel;
