const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure email is unique
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  avatar: {
    type: String
  },
  course: {
    type: String, // Course name
    required: function() { return this.role === 'student'; } // Only required for students
  },
  batch: {
    type: String, // Batch name
    required: function() { return this.role === 'student'; } // Only required for students
  }
});

module.exports = model('User', userSchema);
