const express = require('express');
const router = express.Router();
const Notes = require('../../models/notesModel');
const Assignment = require('../../models/assignmentModel');

// Route to get the total number of assignments based on course and batch
router.get('/assignments/count', async (req, res) => {
  try {
    const { course, batch } = req.query;

    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    const totalAssignments = await Assignment.countDocuments({ course, batch });
    console.log('Total Assignments:', totalAssignments)
    res.json({ totalAssignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// Route to get the total number of lectures based on course and batch
router.get('/lectures/count', async (req, res) => {
  try {
    const { course, batch } = req.query;
    console.log('Query Parameters:', { course, batch }); // Log values

    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    const totalLectures = await Notes.countDocuments({ course, batch });
    console.log('Total Lectures:', totalLectures); // Log result
    res.json({ totalLectures });
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ message: 'Error fetching lectures' });
  }
});


// Route to get the total number of pending assignments based on course and batch
router.get('/assignments/pending/count', async (req, res) => {
  try {
    const { course, batch } = req.query;

    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    const totalPendingAssignments = await Assignment.countDocuments({
      course,
      batch,
      submitted: false
    });

    res.json({ totalPendingAssignments });
  } catch (error) {
    console.error('Error fetching pending assignments:', error);
    res.status(500).json({ message: 'Error fetching pending assignments' });
  }
});


module.exports = router;

