const express = require('express');
const { connect } = require('mongoose');
const cors = require('cors');
const upload = require('express-fileupload');
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');
const totalassignment  = require( './routes/Dashboard/tAssignmentRoutes')
const totalstudent  = require( './routes/Dashboard/tStudentRoutes')


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'assignment-portal-894be.appspot.com'
});

const userRoutes = require('./routes/userRoutes');
const notesRoutes = require('./routes/notesRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submitAssignmentRoutes = require('./routes/submitAssignmentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const app = express();

// Middleware
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(upload());
app.use(cors({
  origin:'http://localhost:5173',

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/assignments', submitAssignmentRoutes);

// Dashboard
app.use('/api', totalassignment);
app.use('/api/students', totalstudent);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server started on port ${process.env.PORT || 5000}`);
  });
}).catch(error => {
  console.error("MongoDB connection error:", error);
});

module.exports = app;
