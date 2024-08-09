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

// Add a new endpoint to get all submissions for a specific assignment
const getAllSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(400).json({ error: 'Invalid assignmentId format' });
        }

        const submissions = await AssignmentSubmission.find({ assignmentId });

        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update submission details (marks and comments)
const updateSubmission = async (req, res) => {
    const { id } = req.params;
    const { marks, comments } = req.body;

    if (typeof marks !== 'number' || typeof comments !== 'string') {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const submission = await AssignmentSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Determine pass/fail based on marks
        const totalMarks = 100; // You might want to get this dynamically if it varies
        const passingPercentage = 50;
        const percentage = (marks / totalMarks) * 100;
        const passFailStatus = percentage >= passingPercentage ? 'Pass' : 'Fail';

        submission.marks = marks;
        submission.comments = comments;
        submission.passFailStatus = passFailStatus

        await submission.save();
        res.status(200).json({ message: 'Submission updated successfully', submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAssignments = async (req, res) => {
    const { studentId } = req.query;

    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    try {
        // Populate the title and totalMarks from the Assignment model
        const assignments = await AssignmentSubmission.find({ studentId })
            .populate({
                path: 'assignmentId',
                select: 'title totalMarks', // Include title and totalMarks fields
            });

        // Map through assignments and include the title and totalMarks
        const assignmentsWithDetails = assignments.map((assignment) => ({
            ...assignment.toObject(),
            title: assignment.assignmentId.title, // Access the title
            totalMarks: assignment.assignmentId.totalMarks, // Access totalMarks
            passFailStatus: assignment.passFailStatus || 'Pending',
        }));

        res.json(assignmentsWithDetails);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitAssignment,
    unsubmitAssignment,
    getSubmissionStatus,
    getAllSubmissions,
    updateSubmission,
    getAssignments
};

