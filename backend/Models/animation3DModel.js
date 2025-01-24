const mongoose = require("mongoose");

const Animation3DSchema = new mongoose.Schema({
    Ani3D_name: {
        type: String,
        required: true,
    },
    Ani3D_animation: {
        data: Buffer,
        contentType: String,
        size: Number
    },
    Ani3D_image: {
        data: Buffer,
        contentType: String,
        size: Number
    },
    Ani3D_description: {
        type: String
    },
});

const animation3DModel = mongoose.model("Animation3D", Animation3DSchema);

module.exports = animation3DModel;