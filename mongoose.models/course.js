const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tracks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Track'
        }
    ],
    tasks: [
        {
            title: { type: String, required: true },
            description: { type: String },
            startDate: { type: Date },
            dueDate: { type: Number },
            file:{
                type: String,

            },
            

            
        }
    ]
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
