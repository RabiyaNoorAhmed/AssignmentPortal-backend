const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const HttpError = require('../models/errorModel');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { v4: uuid } = require("uuid")
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();


const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, gender, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !gender || !role) {
      return next(new HttpError("Fill In All Fields", 422));
    }

    // Validate gender and role
    const validGenders = ['male', 'female', 'other'];
    const validRoles = ['student', 'teacher'];

    if (!validGenders.includes(gender.toLowerCase())) {
      return next(new HttpError("Invalid gender value", 422));
    }
    if (!validRoles.includes(role.toLowerCase())) {
      return next(new HttpError("Invalid role value", 422));
    }

    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    if (password.trim().length < 8) {
      return next(new HttpError("Password should be at least 8 characters", 422));
    }

    if (password !== confirmPassword) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({
      name,
      email: newEmail,
      password: hashedPass,
      gender,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: `New user ${newUser.email} registered` });

  } catch (error) {
    console.error("Registration error:", error);
    return next(new HttpError("User registration failed", 500));
  }
};

  





// LOGIN A REGISTERED USER
//POST : api/users/login
//UnProtected
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are filled
    if (!email || !password) {
      console.log("Email or password missing");
      return next(new HttpError("Fill in all fields", 422));
    }

    // Convert email to lowercase
    const newEmail = email.toLowerCase();

    // Check if the user exists
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      console.log(`User not found with email: ${newEmail}`);
      return next(new HttpError("Invalid credentials", 422));
    }

    // Compare the provided password with the stored hashed password
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      console.log("Password mismatch for user:", newEmail);
      return next(new HttpError("Invalid credentials", 422));
    }

    // Extract user details
    const { _id: id, name, gender, role, photoUrl } = user;

    // Generate a JWT token
    const token = jwt.sign({ id, name, gender, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    console.log(`User ${name} logged in successfully`);

    // Send the response with token and user details
    res.status(200).json({ token, id, name, gender, role, photoUrl });

  } catch (error) {
    console.error("Login error:", error);
    return next(new HttpError("Login failed. Please check your credentials", 500));
  }
};







module.exports = {
    registerUser, loginUser
}





