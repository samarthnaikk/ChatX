require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Redis client
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().then(() => console.log('Redis connected')).catch(console.error);

app.get('/', (req, res) => {
  res.send('ChatX Backend is running');
});
// Models
const User = require('./models/User');
const Chatroom = require('./models/Chatroom');
const Message = require('./models/Message');

// Socket.IO basic connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  // Join chatroom
  socket.on('joinRoom', async ({ chatroomId, userId }) => {
    socket.join(chatroomId);
    // Mark user online in Redis
    await redisClient.hSet('onlineUsers', userId, 'true');
    io.to(chatroomId).emit('userJoined', { userId });
  });

  // Leave chatroom
  socket.on('leaveRoom', async ({ chatroomId, userId }) => {
    socket.leave(chatroomId);
    await redisClient.hSet('onlineUsers', userId, 'false');
    io.to(chatroomId).emit('userLeft', { userId });
  });

  // Send message
  socket.on('sendMessage', async ({ chatroomId, userId, content }) => {
    const message = new Message({ chatroom: chatroomId, sender: userId, content });
    await message.save();
    io.to(chatroomId).emit('newMessage', {
      _id: message._id,
      chatroom: chatroomId,
      sender: userId,
      content,
      timestamp: message.timestamp
    });
  });

  // Get online users
  socket.on('getOnlineUsers', async (chatroomId, callback) => {
    const chatroom = await Chatroom.findById(chatroomId).populate('members');
    const onlineUsers = [];
    for (const member of chatroom.members) {
      const isOnline = await redisClient.hGet('onlineUsers', member._id.toString());
      if (isOnline === 'true') onlineUsers.push(member._id);
    }
    callback(onlineUsers);
  });

  // Disconnect
  socket.on('disconnect', async () => {
    // Optionally handle user offline status here
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
