// utils/uploadFile.js
const admin = require('firebase-admin');

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

module.exports = uploadFile;
