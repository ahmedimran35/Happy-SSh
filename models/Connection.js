const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    default: 22
  },
  username: {
    type: String,
    required: true
  },
  authType: {
    type: String,
    enum: ['password', 'key'],
    required: true
  },
  password: {
    type: String,
    required: function() {
      return this.authType === 'password';
    }
  },
  privateKey: {
    type: String,
    required: function() {
      return this.authType === 'key';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Connection', connectionSchema); 