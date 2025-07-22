const Thread = require('../models/thread');

exports.post = async (req, res) => {
  try {
    const { text, delete_password, board } = req.body;
    const newThread = new Thread({
      board,
      text,
      delete_password,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      replies: []
    });
    const savedThread = await newThread.save();
    res.status(200).send(savedThread);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.get = async (req, res) => {
  try {
    const threads = await Thread.find({ board: req.params.board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .populate('replies', 'text created_on')
      .exec();
    threads.forEach(thread => {
      thread.replies = thread.replies.slice(-3);
    });
    res.status(200).send(threads);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const { thread_id, delete_password } = req.body;
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.status(404).send('Thread not found');
    if (thread.delete_password !== delete_password) return res.status(200).send('incorrect password');
    await thread.remove();
    res.status(200).send('success');
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.put = async (req, res) => {
  try {
    const { thread_id } = req.body;
    const thread = await Thread.findByIdAndUpdate(thread_id, { reported: true }, { new: true });
    if (!thread) return res.status(404).send('Thread not found');
    res.status(200).send('reported');
  } catch (err) {
    res.status(500).send(err);
  }
};