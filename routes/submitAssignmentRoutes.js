const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitAssignment, unsubmitAssignment,getSubmissionStatus, getAllSubmissions, updateSubmission,getAssignments } = require('../controllers/assignmentSubmissionController');
const AssignmentSubmission = require('../models/assignmentSubmissionModel');

// Route to handle assignment submission
router.post('/submit', authMiddleware, submitAssignment);

// Route to handle assignment unsubmission
router.delete('/unsubmit/:submissionId', authMiddleware, unsubmitAssignment);
router.get('/submission-status', authMiddleware, getSubmissionStatus);

router.get('/submissions', authMiddleware, getAllSubmissions);

router.put('/submissions/:id', authMiddleware, updateSubmission);

// Route to get assignments by studentId
router.get('/assignments', getAssignments);

module.exports = router;
