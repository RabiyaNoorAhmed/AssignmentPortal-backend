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

module.exports = router;
