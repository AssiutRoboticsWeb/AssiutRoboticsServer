const mongoose = require('mongoose');
const trackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    committee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        }
    ],
    applicants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        }
    ],
    superVisors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        }
    ],
    HRs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        }
    ]
});

const Track = mongoose.model('Track', trackSchema); 

module.exports = Track;