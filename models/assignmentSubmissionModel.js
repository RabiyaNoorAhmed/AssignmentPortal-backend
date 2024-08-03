const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    studentName: { // Corrected the field name
        type: String,
        required: true
    },
    rollNo: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    fileUrl: {
        type: String
    },
    submissionType: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
module.exports = AssignmentSubmission;
