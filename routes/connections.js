const express = require('express');
const router = express.Router();
const { NodeSSH } = require('node-ssh');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');

// Get all connections for a user
router.get('/', auth, async (req, res) => {
  try {
    const connections = await Connection.find({ user: req.user.userId });
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching connections', error: error.message });
  }
});

// Create new connection
router.post('/', auth, async (req, res) => {
  try {
    const { name, host, port, username, authType, password, privateKey } = req.body;
    
    const connection = new Connection({
      user: req.user.userId,
      name,
      host,
      port,
      username,
      authType,
      password,
      privateKey
    });

    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: 'Error creating connection', error: error.message });
  }
});

// Test connection
router.post('/test', auth, async (req, res) => {
  try {
    const { host, port, username, authType, password, privateKey } = req.body;
    const ssh = new NodeSSH();

    const config = {
      host,
      port,
      username,
      ...(authType === 'password' ? { password } : { privateKey })
    };

    await ssh.connect(config);
    ssh.dispose();
    
    res.json({ message: 'Connection successful' });
  } catch (error) {
    res.status(400).json({ message: 'Connection failed', error: error.message });
  }
});

// Delete connection
router.delete('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json({ message: 'Connection deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting connection', error: error.message });
  }
});

module.exports = router; 