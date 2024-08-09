const express = require('express');
const router = express.Router();
const Assignment = require('../../models/assignmentModel');


// Route to get the total number of assignments based on course and batch
router.get('/assignments/count', async (req, res) => {
  try {
    const { course, batch } = req.query;

    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    const totalAssignments = await Assignment.countDocuments({ course, batch });
    // console.log('Total Assignments:', totalAssignments)
    res.json({ totalAssignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

module.exports = router;
