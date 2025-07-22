const Thread = require('../models/thread');

exports.post = (req, res) => {
  const { text, delete_password } = req.body;
  const newThread = new Thread({
    text,
    delete_password,
    created_on: new Date(),
    bumped_on: new Date(),
    reported: false,
    replies: []
  });
  newThread.save((err, savedThread) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(savedThread);
  });
};

exports.get = (req, res) => {
  Thread.find({ board: req.params.board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .populate('replies', 'text created_on')
    .exec((err, threads) => {
      if (err) return res.status(500).send(err);
      res.status(200).send(threads);
    });
};

exports.delete = (req, res) => {
  const { thread_id, delete_password } = req.body;
  Thread.findById(thread_id, (err, thread) => {
    if (err) return res.status(500).send(err);
    if (!thread) return res.status(404).send('Thread not found');
    if (thread.delete_password !== delete_password) return res.status(200).send('incorrect password');
    thread.remove((err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('success');
    });
  });
};

exports.put = (req, res) => {
  const { thread_id } = req.body;
  Thread.findByIdAndUpdate(thread_id, { reported: true }, (err, thread) => {
    if (err) return res.status(500).send(err);
    if (!thread) return res.status(404).send('Thread not found');
    res.status(200).send('reported');
  });
};