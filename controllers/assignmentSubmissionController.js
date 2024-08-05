const uploadFile = require('../utils/uploadFile');
const AssignmentSubmission = require('../models/assignmentSubmissionModel');
const mongoose = require('mongoose');
const Assignment = require('../models/assignmentModel');
const HttpError = require('../models/errorModel');

const submitAssignment = async (req, res) => {
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
//     // Validate inputs
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

        //Check for file upload in the request
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

        // Update assignment's submitted status
        await Assignment.findByIdAndUpdate(assignmentId, { submitted: true });

        res.status(201).json({ message: 'Assignment submitted successfully', submissionId: newSubmission._id });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const unsubmitAssignment = async (req, res) => {
    try {
        const { submissionId } = req.params;

        console.log('Received submissionId for unsubmit:', submissionId);

        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return res.status(400).json({ error: 'Invalid submissionId format' });
        }

        // Remove submission data from the database by _id
        const submission = await AssignmentSubmission.findByIdAndDelete(submissionId);

        if (!submission) {
            console.log('Submission not found for ID:', submissionId);
            return res.status(404).json({ error: 'Submission not found' });
        }

        console.log('Deleted submission:', submission);

        // Update assignment status
        const assignment = await Assignment.findById(submission.assignmentId);

        if (assignment) {
            assignment.submitted = false;
            await assignment.save();

            console.log('Updated assignment:', assignment);
        } else {
            console.log('Assignment not found for ID:', submission.assignmentId);
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Assignment unsubmitted successfully' });
    } catch (error) {
        console.error('Error unsubmitting assignment:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const getSubmissionStatus = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.query;

        const submission = await AssignmentSubmission.findOne({
            assignmentId,
            studentId,
        });

        if (submission) {
            res.status(200).json({ submitted: true, submissionId: submission._id });
        } else {
            res.status(200).json({ submitted: false });
        }
    } catch (error) {
        console.error('Error fetching submission status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    submitAssignment,
    unsubmitAssignment,
    getSubmissionStatus,
};
