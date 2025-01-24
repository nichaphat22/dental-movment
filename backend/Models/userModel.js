const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Please provide email'],
        },
        name: {
            type: String,
        },
        img: {
            type: String,
        },
        role: {
            type: String,
            enum: ['student', 'teacher'],
            required: true,
            default: 'student',
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        },
        deleted_at: {
            type: Date,
            default: null,
        },
        userKku: {
            type:String,
            
        },
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
