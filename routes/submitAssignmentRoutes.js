// routes/submitAssignmentRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitAssignment } = require('../controllers/assignmentSubmissionController');

// Route to handle assignment submission
router.post('/submit', authMiddleware, submitAssignment);

module.exports = router;
