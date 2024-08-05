// models/Assignment.js
const { Schema, model } = require('mongoose');


const assignmentSchema = new Schema({
  title: {
     type: String,
      required: true 
    },
  dueDate: {
     type: Date,
      required: true 
    },
  description: {
     type: String,
      required: true
     },
  link: { 
    type: String 
},
  file: {
     type: String 
    },
  totalMarks: {
     type: Number, 
     required: true
     },
  course: {
     type: String,
      required: true 
    },
  batch: {
     type: String, 
     required: true 
    },
    submitted: {  // Added field
      type: Boolean,
      default: false
    }
});

module.exports = model('Assignment', assignmentSchema);