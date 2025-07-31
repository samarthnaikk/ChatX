const mongoose = require('mongoose');

const ChatroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Chatroom', ChatroomSchema);
