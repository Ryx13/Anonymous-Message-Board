const Thread = require('../models/thread');

exports.post = async (req, res) => {
  try {
    const { text, delete_password, thread_id } = req.body;
    const newReply = {
      text,
      delete_password,
      created_on: new Date(),
      reported: false
    };
    const thread = await Thread.findByIdAndUpdate(thread_id, {
      $push: { replies: newReply },
      $set: { bumped_on: new Date() }
    }, { new: true });
    if (!thread) return res.status(404).send('Thread not found');
    res.status(200).send(thread);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.get = async (req, res) => {
  try {
    const thread = await Thread.findById(req.query.thread_id)
      .populate('replies', 'text created_on')
      .exec();
    if (!thread) return res.status(404).send('Thread not found');
    res.status(200).send(thread);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const { thread_id, reply_id, delete_password } = req.body;
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.status(404).send('Thread not found');
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.status(404).send('Reply not found');
    if (reply.delete_password !== delete_password) return res.status(200).send('incorrect password');
    reply.text = '[deleted]';
    await thread.save();
    res.status(200).send('success');
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.put = async (req, res) => {
  try {
    const { thread_id, reply_id } = req.body;
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.status(404).send('Thread not found');
    const reply = thread.replies.id(reply_id);
    if (!reply) return res.status(404).send('Reply not found');
    reply.reported = true;
    await thread.save();
    res.status(200).send('reported');
  } catch (err) {
    res.status(500).send(err);
  }
};