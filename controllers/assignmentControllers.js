
const Assignment = require('../models/assignmentModel');
const uploadFile = require('../utils/uploadFile');
const mongoose = require('mongoose');


const getAssignments = async (req, res, next) => {
    const { course, batch } = req.query;
  
    if (!course || !batch) {
      return next(new HttpError('Course and batch parameters are required', 400));
    }
  
    try {
      const assignments = await Assignment.find({ course, batch });
  
      if (!assignments.length) {
        return res.status(404).json({ message: 'No assignments found for the specified course and batch' });
      }
  
      res.status(200).json(assignments);
    } catch (error) {
      next(new HttpError('Failed to retrieve assignments', 500));
    }
  };




const addAssignment = async (req, res, next) => {
  try {
    let fileUrl = '';

    if (req.files && req.files.file) {
      const file = req.files.file;
      const fileName = `uploads/assignments/${Date.now()}_${file.name}`;
      const [signedUrl] = await uploadFile(file, fileName);
      fileUrl = signedUrl;
    }

    const newAssignment = new Assignment({
      title: req.body.title,
      dueDate: req.body.dueDate,
      description: req.body.description,
      link: req.body.link,
      file: fileUrl,
      totalMarks: req.body.totalMarks,
      course: req.body.course,
      batch: req.body.batch
    });

    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    next(new HttpError('Failed to add assignment', 500));
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid ID:', id);
      return res.status(400).json({ message: 'Invalid assignment ID' });
    }

    const existingAssignment = await Assignment.findById(id);
    if (!existingAssignment) {
      console.error('Assignment not found for ID:', id);
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Handle file upload if a new file is provided
    let fileUrl = existingAssignment.file;
    if (req.files && req.files.file) {
      const file = req.files.file;
      const fileName = `uploads/assignments/${Date.now()}_${file.name}`;
      const [signedUrl] = await uploadFile(file, fileName);
      fileUrl = signedUrl;
    }

    // Update the assignment
    existingAssignment.title = req.body.title;
    existingAssignment.dueDate = req.body.dueDate;
    existingAssignment.description = req.body.description;
    existingAssignment.link = req.body.link;
    existingAssignment.file = fileUrl;
    existingAssignment.totalMarks = req.body.totalMarks;
    existingAssignment.course = req.body.course;
    existingAssignment.batch = req.body.batch;

    await existingAssignment.save();

    res.json(existingAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Failed to update assignment', error: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};

module.exports = {
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
};
