const uploadFile = require('../utils/uploadFile');
const AssignmentSubmission = require('../models/assignmentSubmissionModel');
const mongoose = require('mongoose');
const Assignment = require('../models/assignmentModel');
const HttpError = require('../models/errorModel');

const submitAssignment = async (req, res, next) => {
  try {
    const {
      studentId,
      assignmentId,
      name,
      rollNo,
      title,
      description,
      submissionType,
      link,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return next(new HttpError('Invalid assignmentId', 400));
    }

    // Check for file upload in the request
    const file = req.files ? req.files.file : null;

    // Validate inputs
    if (
      !studentId ||
      !assignmentId ||
      !name ||
      !rollNo ||
      !title ||
      !description ||
      !submissionType
    ) {
      return next(new HttpError('Missing required fields', 400));
    }

    // Handle file upload if a file is provided
    let fileUrl = null;
    if ((submissionType === 'file' || submissionType === 'both') && file) {
      const fileName = `uploads/submissions/${Date.now()}_${file.name}`;
      try {
        const [url] = await uploadFile(file, fileName);
        fileUrl = url;
      } catch (uploadError) {
        return next(new HttpError('File upload failed', 500));
      }
    }

    // Save submission data to the database
    const newSubmission = new AssignmentSubmission({
      studentId,
      assignmentId,
      studentName: name,
      rollNo,
      title,
      description,
      link,
      fileUrl,
      submissionType,
      submittedAt: new Date(),
    });

    await newSubmission.save();

    // Update assignment status
    const assignment = await Assignment.findById(assignmentId);
    if (assignment) {
      assignment.submitted = true;
      await assignment.save();
      console.log('Assignment updated:', assignment);
    }

    // Send back the response with the new submission ID
    res.status(201).json({
      message: 'Assignment submitted successfully',
      submissionId: newSubmission._id, // Include the submissionId
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return next(new HttpError('Internal server error', 500));
  }
};

const unsubmitAssignment = async (req, res, next) => {
  try {
    const { submissionId } = req.params; // Get submissionId from URL params

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: 'Invalid submissionId format' });
    }

    // Remove submission data from the database by _id
    const submission = await AssignmentSubmission.findByIdAndDelete(submissionId);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update assignment status
    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment) {
      assignment.submitted = false;
      await assignment.save();
    }

    res.status(200).json({ message: 'Assignment unsubmitted successfully' });
  } catch (error) {
    console.error('Error unsubmitting assignment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitAssignment,
  unsubmitAssignment,
};

