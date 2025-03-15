const mongoose = require('mongoose')


const studentSchema = new mongoose.Schema(
{

    yearLevel : {
        type : String,
        default : null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
}, {
    timestamps: true
}
)

const studentModel = mongoose.model('Student', studentSchema)

module.exports = studentModel