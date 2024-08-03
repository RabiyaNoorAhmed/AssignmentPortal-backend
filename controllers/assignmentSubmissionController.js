// controllers/assignmentController.js
const uploadFile = require('../utils/uploadFile');
const AssignmentSubmission = require('../models/assignmentSubmissionModel');
const mongoose = require('mongoose');
const Assignment = require('../models/assignmentModel');

const submitAssignment = async (req, res) => {
    try {
        const { studentId, assignmentId, name, rollNo, title, description, submissionType, link } = req.body;
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(400).json({ error: 'Invalid assignmentId' });
        }
        
        // Check for file upload in the request
        const file = req.files ? req.files.file : null; // Expecting file under key 'file'

        // Validate inputs
        if (!studentId || !assignmentId || !name || !rollNo || !title || !description || !submissionType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Handle file upload if a file is provided
        let fileUrl = null;
        if ((submissionType === 'file' || submissionType === 'both') && file) {
            const fileName = `uploads/submissions/${Date.now()}_${file.name}`;
            try {
                const [url] = await uploadFile(file, fileName); // Assuming uploadFile returns a URL
                fileUrl = url;
            } catch (uploadError) {
                return res.status(500).json({ message: 'File upload failed' });
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
            submittedAt: new Date()
        });

        await newSubmission.save();

        // Update assignment status
        const assignment = await Assignment.findById(assignmentId);
        if (assignment) {
            assignment.submitted = true; // Update status
            await assignment.save();
            console.log('Assignment updated:', assignment);
        }

        res.status(201).json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    submitAssignment,
};
