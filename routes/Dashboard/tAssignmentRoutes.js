const express = require('express');
const router = express.Router();
const Assignment = require('../../models/assignmentModel');

// Route to get the total number of assignments
router.get('/total-assignments', async (req, res) => {
  try {
    const totalAssignments = await Assignment.countDocuments();
    res.json({ totalAssignments });
  } catch (error) {
    console.error('Error fetching total assignments:', error);
    res.status(500).json({ message: 'Error fetching total assignments', error: error.message });
  }
});

module.exports = router;
