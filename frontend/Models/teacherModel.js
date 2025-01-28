const mongoose = require('mongoose')


const teacherSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    quiz:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
}, {
    timestamps: true
}
)

const teacherModel = mongoose.model('Teacher', teacherSchema)

module.exports = teacherModel