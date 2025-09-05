const mongoose = require("mongoose");

const modelsSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
      
    },
    modelUrl: {
      type: String,
      required: true,
    },
    patternUrl: {
      type: String,
      required: true,
    },
    markerUrl: {
      name: String ,  
      path: { type: String, required: true },   
      mimetype: { type: String },
      size: { type: Number }, // ไบต์
    },
    imageUrl: {
      type: String,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model("Model3D", modelsSchema);