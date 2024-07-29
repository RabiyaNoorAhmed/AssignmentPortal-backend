const express = require('express');
const {
    getNotesByCourseAndBatch,
    addNote,
    updateNote,
    deleteNote
} = require('../controllers/notesControllers');

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
// Get notes by course and batch
router.get('/filter', authMiddleware, getNotesByCourseAndBatch);

// Add a new note
router.post('/', authMiddleware, addNote);

// Update a note
router.patch('/:id', authMiddleware, updateNote);

// Delete a note
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;
