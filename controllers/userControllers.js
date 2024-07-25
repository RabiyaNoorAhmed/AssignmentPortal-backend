const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const HttpError = require('../models/errorModel');

const admin = require('firebase-admin');
const bucket = admin.storage().bucket();






module.exports = {
    registerUser, loginUser
}





