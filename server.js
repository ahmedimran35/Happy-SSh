require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { NodeSSH } = require('node-ssh');
const authRoutes = require('./routes/auth');
const connectionRoutes = require('./routes/connections');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ssh-terminal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionRoutes);

// Store active SSH connections
const activeConnections = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  const activeConnections = new Map();

  socket.on('connect-ssh', async (connectionData) => {
    try {
      console.log('Attempting SSH connection:', connectionData.host);
      const ssh = new NodeSSH();
      
      const config = {
        host: connectionData.host,
        port: connectionData.port || 22,
        username: connectionData.username,
        readyTimeout: 20000,
        keepaliveInterval: 10000,
      };

      if (connectionData.password) {
        config.password = connectionData.password;
      } else if (connectionData.privateKey) {
        config.privateKey = connectionData.privateKey;
      }

      await ssh.connect(config);
      console.log('SSH connection established');

      // Create shell session
      const shell = await ssh.requestShell();
      console.log('Shell session created');

      // Store both SSH and shell in the connections map
      activeConnections.set(socket.id, { ssh, shell });

      // Set up shell event handlers
      shell.on('data', (data) => {
        console.log('Shell data received:', data.toString());
        socket.emit('ssh-data', data.toString());
      });

      shell.on('error', (err) => {
        console.error('Shell error:', err);
        socket.emit('ssh-error', err.message);
      });

      // Send initial success message
      socket.emit('ssh-data', '\r\n\x1b[32mConnected successfully!\x1b[0m\r\n');

      // Handle terminal input
      socket.on('terminal-input', (data) => {
        const connection = activeConnections.get(socket.id);
        if (connection && connection.shell) {
          console.log('Writing to shell:', data);
          connection.shell.write(data);
        }
      });

    } catch (error) {
      console.error('SSH connection error:', error);
      socket.emit('ssh-error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const connection = activeConnections.get(socket.id);
    if (connection) {
      if (connection.shell) {
        connection.shell.end();
      }
      if (connection.ssh) {
        connection.ssh.dispose();
      }
      activeConnections.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 