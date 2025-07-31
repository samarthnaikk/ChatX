const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  online: { type: Boolean, default: false },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
