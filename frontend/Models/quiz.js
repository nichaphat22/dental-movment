const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    questions:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    ],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
},{
    timestamps: true
})

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz