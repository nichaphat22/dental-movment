const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    totalQuestion: {
        type: Number,
        required: true
    }

}, {timeseries: true});

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;