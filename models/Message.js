const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
