const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  board: String,
  text: String,
  delete_password: String,
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  replies: [
    {
      text: String,
      delete_password: String,
      created_on: { type: Date, default: Date.now },
      reported: { type: Boolean, default: false }
    }
  ]
});

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;