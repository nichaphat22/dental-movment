const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
            ref: 'Chat', // Assuming there's a Chat model
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
            ref: 'User', // Assuming there's a User model
            required: true
        },
        text: {
            type: String,
        },
        file: {
               name: { type: String },
        data: { type: String },
        type: { type: String },
        size: { type: Number },
        },
    },
    {
        timestamps: true,
    }
);

const messageModel = mongoose.model("Message", messageSchema)

module.exports = messageModel;