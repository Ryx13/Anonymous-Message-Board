const mongoose = require("mongoose");
const Thread = require("./database.js").Thread;
const hash = require("./hash.js");

exports.post = (req, res) => {
  const { text, delete_password, thread_id } = req.body;
  const newReply = {
    text,
    delete_password,
    created_on: new Date(),
    reported: false
  };
  Thread.findByIdAndUpdate(thread_id, {
    $push: { replies: newReply },
    $set: { bumped_on: new Date() }
  }, (err, thread) => {
    if (err) return res.status(500).send(err);
    if (!thread) return res.status(404).send('Thread not found');
    res.status(200).send(thread);
  });
};

exports.get = (req, res) => {
  Thread.findById(req.query.thread_id)
    .populate('replies', 'text created_on')
    .exec((err, thread) => {
      if (err) return res.status(500).send(err);
      if (!thread) return res.status(404).send('Thread not found');
      res.status(200).send(thread);
    });
};

exports.delete = (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;
  Thread.findById(thread_id, (err, thread) => {
    if (err) return res.status(500).send(err);
    if (!thread) return res.status(404).send('Thread not found');
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.status(404).send('Reply not found');
    if (reply.delete_password !== delete_password) return res.status(200).send('incorrect password');
    reply.text = '[deleted]';
    thread.save((err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('success');
    });
  });
};

exports.put = (req, res) => {
  const { thread_id, reply_id } = req.body;
  Thread.findById(thread_id, (err, thread) => {
    if (err) return res.status(500).send(err);
    if (!thread) return res.status(404).send('Thread not found');
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.status(404).send('Reply not found');
    reply.reported = true;
    thread.save((err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('reported');
    });
  });
};