const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
    },
    choices: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: Number,
        required: true
    },
    answerExplanation: {
        type: String,
        required: false,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
    },

},{
    timestamps: true
});

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question