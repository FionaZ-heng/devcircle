const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Match = require('./models/Match');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'https://devcircle-sigma.vercel.app', methods: ['GET', 'POST'] }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'DevCircle API is running 🚀' });
});

// Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join personal room for direct notifications
  socket.join(socket.userId);

  socket.on('join_room', (matchId) => {
    socket.join(matchId);
  });

  socket.on('send_message', async ({ matchId, content }) => {
    try {
      const match = await Match.findById(matchId);
      if (!match) return;

      const isParticipant =
        match.requester.toString() === socket.userId ||
        match.receiver.toString() === socket.userId;
      if (!isParticipant) return;

      const msg = await Message.create({
        matchId, sender: socket.userId, content
      });
      const populated = await msg.populate('sender', 'username');
      io.to(matchId).emit('receive_message', populated);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});