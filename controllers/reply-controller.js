const mongoose = require("mongoose");
const Thread = require("./database.js").Thread;
const hash = require("./hash.js");

// POST Function that adds a new reply to a thread in the databasse
exports.post = async function(req, res) {
  const { text, delete_password, thread_id } = req.body;
  const board = req.params.board;

  const hashedPassword = await hash.hashInput(delete_password);
  const dateString = new Date();

  // Find the thread and update it
  const replyObject = {
    _id: new mongoose.Types.ObjectId(),
    text: text,
    created_on: dateString,
    delete_password: hashedPassword,
    reported: false
  };
  Thread.findByIdAndUpdate(thread_id, { $set: { bumped_on: dateString }, $push: { replies: replyObject } })
    .then((updated) => {
    })
    .catch((err) => {
      console.log(err);
    });

  return res.redirect(`/b/${board}`);
};

// GET Function that looks up a thread in the database and returns it with all of its replies
exports.get = async function(req, res) {
  let returnThread = {};

  await Thread.findById(req.query.thread_id)
    .then((thread) => {
      let currentThread = thread._doc;
      delete currentThread.__v;
      delete currentThread.reported;
      delete currentThread.delete_password;
      currentThread.replies.sort((a, b) => b.created_on - a.created_on);
      currentThread.replies.forEach((reply) => {
        delete reply.delete_password;
        delete reply.reported;
      });
      returnThread = currentThread;
    })
    .catch((err) => {
      console.error(err);
    });
  return res.json(returnThread);
}

// DELETE function that looks up a thread in the database, then edits the text in a reply in its reply array to '[deleted]'
exports.delete = async function(req, res) {
  let { thread_id, reply_id, delete_password } = req.body;

  let passwordMatches = false;
  let deleted = false;

  await Thread.findOne({
    "replies": {
      $elemMatch: {
        "_id": reply_id
      }
    }
  })
    .then(async (thread) => {
      passwordMatches = await hash.compareHash(delete_password, thread.replies[0].delete_password);
    })
    .catch((err) => {
      console.error(err);
    });

  if (passwordMatches === true) {
    const filter = {
        "replies": {
          $elemMatch: {
            "_id": reply_id
          }
        }
      };

    const update = {
      $set: {
        "replies.$.text": "[deleted]"
      }
    };

    await Thread.updateOne(filter, update)
      .then((updated) => {
        deleted = true;
      })
      .catch((err) => {
        console.error(err);
        deleted = false;
      })
  };

  if (deleted === true) {
    return res.send("success");
  } else {
    return res.send("incorrect password");
  };
};

// PUT Function that changes the value of 'reported' in a specific reply to true
exports.put = async function(req, res) {
  const { thread_id, reply_id } = req.body;

  const filter = {
    "replies": {
      $elemMatch: {
        "_id": reply_id
      }
    }
  }

  const update = {
    $set: {
      "replies.$.reported": true
    }
  };

  await Thread.findOneAndUpdate(filter, update)
    .then((updated) => {
    })
    .catch((err) => {
      console.error(err);
    });

  res.send("reported");
};