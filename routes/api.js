const express  = require('express');
const router   = express.Router();
const ObjectId = require('mongodb').ObjectId;

/* ----------  UTILS  ---------- */
function cleanDoc(doc) {
  delete doc.delete_password;
  delete doc.reported;
  return doc;
}
function cleanReplies(arr) {
  return arr.map(r => {
    delete r.delete_password;
    delete r.reported;
    return r;
  });
}

/* ----------  THREAD ROUTES  ---------- */

// POST /api/threads/:board
router.post('/threads/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { text, delete_password } = req.body;

  const doc = {
    text,
    delete_password,
    created_on: new Date(),
    bumped_on:  new Date(),
    reported: false,
    replies: []
  };

  const result = await db.collection(board).insertOne(doc);
  res.json({ _id: result.insertedId, ...doc });
});

// GET /api/threads/:board
router.get('/threads/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;

  const threads = await db.collection(board)
    .find({})
    .sort({ bumped_on: -1 })
    .limit(10)
    .toArray();

  const cleaned = threads.map(t => {
    t = cleanDoc(t);
    t.replies = cleanReplies(t.replies).slice(-3); // last 3 only
    t.replycount = t.replies.length;
    return t;
  });

  res.json(cleaned);
});

// DELETE /api/threads/:board
router.delete('/threads/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { thread_id, delete_password } = req.body;

  const doc = await db.collection(board).findOne({ _id: new ObjectId(thread_id) });
  if (!doc || doc.delete_password !== delete_password) {
    return res.send('incorrect password');
  }
  await db.collection(board).deleteOne({ _id: new ObjectId(thread_id) });
  res.send('success');
});

// PUT /api/threads/:board  (report)
router.put('/threads/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { thread_id } = req.body;

  await db.collection(board).updateOne(
    { _id: new ObjectId(thread_id) },
    { $set: { reported: true } }
  );
  res.send('reported');
});

/* ----------  REPLY ROUTES  ---------- */

// POST /api/replies/:board
router.post('/replies/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { thread_id, text, delete_password } = req.body;

  const reply = {
    _id: new ObjectId(),
    text,
    created_on: new Date(),
    delete_password,
    reported: false
  };

  await db.collection(board).updateOne(
    { _id: new ObjectId(thread_id) },
    {
      $push: { replies: reply },
      $set:  { bumped_on: new Date() }
    }
  );
  res.json(reply);
});

// GET /api/replies/:board
router.get('/replies/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { thread_id } = req.query;

  const thread = await db.collection(board).findOne({ _id: new ObjectId(thread_id) });
  if (!thread) return res.send('not found');

  thread.replies = cleanReplies(thread.replies);
  res.json(cleanDoc(thread));
});

// PUT /api/replies/:board  (report)
router.put('/replies/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { thread_id, reply_id } = req.body;

  await db.collection(board).updateOne(
    { _id: new ObjectId(thread_id), 'replies._id': new ObjectId(reply_id) },
    { $set: { 'replies.$.reported': true } }
  );
  res.send('reported');
});

// DELETE /api/replies/:board
router.delete('/replies/:board', async (req, res) => {
  const db = req.app.locals.db;
  const board = req.params.board;
  const { thread_id, reply_id, delete_password } = req.body;

  const thread = await db.collection(board).findOne({ _id: new ObjectId(thread_id) });
  if (!thread) return res.send('incorrect password');

  const reply = thread.replies.find(r => r._id.toString() === reply_id);
  if (!reply || reply.delete_password !== delete_password) {
    return res.send('incorrect password');
  }

  await db.collection(board).updateOne(
    { _id: new ObjectId(thread_id), 'replies._id': new ObjectId(reply_id) },
    { $set: { 'replies.$.text': '[deleted]' } }
  );
  res.send('success');
});

module.exports = router;