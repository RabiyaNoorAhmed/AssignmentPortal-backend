// routes/assignmentRoutes.js
const express = require('express');
const {
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get assignments
router.get('/filter', authMiddleware, getAssignments);

// Add assignment
router.post('/', authMiddleware, addAssignment);

// Update assignment
router.patch('/:id', authMiddleware, updateAssignment);

// Delete assignment
router.delete('/:id', authMiddleware, deleteAssignment);

module.exports = router;
