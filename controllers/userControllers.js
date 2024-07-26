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

// CHANGE USER AVATAR (PROFILE PICTURE)
//POST : api/users/change-avatar
//Protected
const changeAvatar = async (req, res, next) => {
  try {
      if (!req.files || !req.files.avatar) {
          return next(new HttpError("Please Choose An Image.", 422));
      }

      const { avatar } = req.files;

      // Check File Size
      if (avatar.size > 500000) {
          return next(new HttpError("Profile Picture too big. Should be less than 500kb", 422));
      }
      // Find user from Database (example: MongoDB)
      const user = await User.findById(req.user.id);
      // Delete old Avatar if exists
      if (user.avatar) {
          try {
              const oldAvatarFile = bucket.file(`uploads/avatars/${user.avatar}`);
              const [exists] = await oldAvatarFile.exists();
              if (exists) {
                  await oldAvatarFile.delete();
                  console.log(`Old avatar ${user.avatar} deleted successfully`);
              } else {
                  console.log(`Old avatar ${user.avatar} not found in storage`);
              }
          } catch (error) {
              console.error("Error deleting old avatar:", error);
              // Handle deletion error gracefully, such as logging or continuing without blocking
          }
      }
      // Generate new filename for avatar
      const fileName = `${uuid()}.${avatar.name.split('.').pop()}`;
      const fileUpload = bucket.file(`uploads/avatars/${fileName}`);

      // Create write stream for file upload
      const avatarStream = fileUpload.createWriteStream({
          metadata: {
              contentType: avatar.mimetype,
          },
          resumable: false // Optional: Disables resumable uploads, useful for smaller files
      });

      // Handle upload errors
      avatarStream.on('error', (err) => {
          console.error("Error uploading avatar:", err);
          return next(new HttpError("Failed to upload avatar", 500));
      });

      // Handle upload completion
      avatarStream.on('finish', async () => {
          // Make uploaded file publicly accessible
          await fileUpload.makePublic();

          // Get the public URL of the uploaded file
          const avatarUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

          // Update user's avatar field in your database (if needed)
          // Example: MongoDB update
          await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true });

          // Return the avatar URL to the client
          res.status(200).json({ avatarUrl });
      });

      // Start uploading avatar data
      avatarStream.end(avatar.data);

  } catch (error) {
      console.error("Change avatar error:", error);
      return next(new HttpError(error.message, 500));
  }
};


// EDIT USER DETAILS (from profile)
//POST : api/users/edit-user
//Protected
const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;

    // Check if any required field is missing
    if (!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
      return next(new HttpError('Fill in all Fields', 422));
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User Not Found.", 403));
    }

    // Check if the new email doesn't already exist
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== req.user.id.toString()) {
      return next(new HttpError("Email already Exists.", 422));
    }

    // Compare current password to database password
    const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validateUserPassword) {
      return next(new HttpError("Invalid Current Password.", 422));
    }

    // Compare new passwords
    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("New Passwords do not Match.", 422));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update user info in database
    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, password: hash },
      { new: true }
    );

    res.status(200).json(newInfo);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return next(new HttpError(error.message || 'Internal Server Error', 500));
  }
}



module.exports = {
    registerUser, loginUser
, changeAvatar,
    editUser
}





