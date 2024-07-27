const Note = require('../models/notesModel');
const HttpError = require('../models/errorModel'); 
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();

// Get notes by course and batch
const getNotesByCourseAndBatch = async (req, res, next) => {
    const { course, batch } = req.query;
  
    if (!course || !batch) {
      return next(new HttpError('Course and batch parameters are required', 400));
    }
  
    try {
      const notes = await Note.find({ course, batch });
  
      if (!notes.length) {
        return res.status(404).json({ message: 'No notes found for the specified course and batch' });
      }
  
      res.status(200).json(notes);
    } catch (error) {
      next(new HttpError('Failed to retrieve notes', 500));
    }
  };
  

// Add a new note
const uploadFile = async (file, fileName) => {
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(fileName);
  
    await fileUpload.save(file.data, {
      metadata: {
        contentType: file.mimetype
      }
    });
  
    return fileUpload.getSignedUrl({ action: 'read', expires: '03-09-2491' });
  };
  
  // Add a new note
  const addNote = async (req, res, next) => {
    try {
      let fileUrl = '';
  
      if (req.files && req.files.file) {
        const file = req.files.file;
        const fileName = `uploads/lectures/${Date.now()}_${file.name}`;
        const [signedUrl] = await uploadFile(file, fileName);
        fileUrl = signedUrl;
      }
  
      const newNote = new Note({
        title: req.body.title,
        date: req.body.date,
        content: req.body.content,
        link: req.body.link,
        file: fileUrl,
        course: req.body.course,
        batch: req.body.batch
      });
  
      await newNote.save();
      res.status(201).json(newNote);
    } catch (error) {
      next(new HttpError('Failed to add note', 500));
    }
  };
  

// Update a note

const updateNote = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('Invalid ID:', id);
        return res.status(400).json({ message: 'Invalid note ID' });
      }
  
      const existingNote = await Note.findById(id);
      if (!existingNote) {
        console.error('Note not found for ID:', id);
        return res.status(404).json({ message: 'Note not found' });
      }
  
      // Handle file upload if a new file is provided
      let fileUrl = existingNote.file;
      if (req.files && req.files.file) {
        const file = req.files.file;
        const fileName = `uploads/lectures/${Date.now()}_${file.name}`;
        const [signedUrl] = await uploadFile(file, fileName);
        fileUrl = signedUrl;
      }
  
      // Update the note
      existingNote.title = req.body.title;
      existingNote.date = req.body.date;
      existingNote.content = req.body.content;
      existingNote.link = req.body.link;
      existingNote.file = fileUrl;
      existingNote.course = req.body.course;
      existingNote.batch = req.body.batch;
  
      await existingNote.save();
  
      res.json(existingNote);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ message: 'Failed to update note', error: error.message });
    }
  };
  




// Delete a note
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid ID:', id);
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      console.error('Note not found for ID:', id);
      return next(new HttpError('Note not found', 404));
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    next(new HttpError('Failed to delete note', 500));
  }
};


module.exports = {
    getNotesByCourseAndBatch,
    addNote,
    updateNote,
    deleteNote,
};
