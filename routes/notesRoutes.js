const express = require('express');
const {
    getNotesByCourseAndBatch,
    addNote,
    updateNote,
    deleteNote
} = require('../controllers/notesControllers');

const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// Get notes by course and batch
router.get('/filter', getNotesByCourseAndBatch);

// Add a new note
router.post('/', addNote);

// Update a note
router.patch('/:id', updateNote);

// Delete a note
router.delete('/:id', deleteNote);

module.exports = router;
