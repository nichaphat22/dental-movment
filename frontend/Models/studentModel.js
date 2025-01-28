const mongoose = require('mongoose')


const studentSchema = new mongoose.Schema(
{
    studentId : {
        type : 'string',
        unique : true
    },
    yearLevel : {
        type : String,
        default : null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    quizResult: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'QuizResult'
    },
}, {
    timestamps: true
}
)

const studentModel = mongoose.model('Student', studentSchema)

module.exports = studentModel