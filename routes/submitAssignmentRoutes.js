const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitAssignment, unsubmitAssignment,getSubmissionStatus } = require('../controllers/assignmentSubmissionController');

// Route to handle assignment submission
router.post('/submit', authMiddleware, submitAssignment);

// Route to handle assignment unsubmission
router.delete('/unsubmit/:submissionId', authMiddleware, unsubmitAssignment);
router.get('/submission-status', authMiddleware, getSubmissionStatus);
module.exports = router;
