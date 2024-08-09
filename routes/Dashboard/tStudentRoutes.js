const express = require('express');
const router = express.Router();
const User = require('../../models/userModel');

// Endpoint to get students count by course and batch
router.get('/count', async (req, res) => {
  const { course, batch } = req.query;

  try {
    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    const studentCount = await User.countDocuments({ course, batch, role: 'student' });

    res.json({ studentCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student count' });
  }
});


router.get('/missing-assignments-count', async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Assuming you have a way to identify which assignments belong to the student
    const assignments = await Assignment.find({
      studentId: studentId,
      dueDate: { $lt: new Date() },
      submitted: false, // Assuming you have a `submitted` field
    });

    res.json({ count: assignments.length });
  } catch (error) {
    console.error('Error fetching missing assignments count:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





module.exports = router;
