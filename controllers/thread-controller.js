const Thread = require("./database.js").Thread;
const hash = require("./hash.js");

// POST Function that adds a new thread to the database
exports.post = async function(req, res) {
  const { text, delete_password } = req.body;
  const board = req.params.board;

  const hashedPassword = await hash.hashInput(delete_password);
  const dateString = new Date();
  const newThread = new Thread({
    text: text,
    delete_password: hashedPassword,
    created_on: dateString,
    bumped_on: dateString,
    reported: false,
    replies: [],
    board: board
  });

  const result = await newThread.save()
    .then((saved) => {
      return [saved.board, saved._id.toString()];
    })
    .catch((err) => {
      console.error(err);
      return false; // Return false if there is an error
    });

  return res.redirect(302, `/b/${result[0]}/${result[1]}`);
};

// GET Function that looks up the 10 newest bumped threads in the database
exports.get = async function(req, res) {
  const returnValue = [];
  await Thread.find({ board: req.params.board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .exec()
    .then((threads) => {
      threads.forEach((thread) => {
        let currentThread = thread._doc;
        delete currentThread.__v;
        delete currentThread.reported;
        delete currentThread.delete_password;
        currentThread.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3);
        currentThread.replies.forEach((reply) => {
          delete reply.delete_password;
          delete reply.reported;
        });
        returnValue.push(currentThread);
      });
      return;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });

  return res.json(returnValue);
}

// DELETE Function that looks up a thread in the database by its ID and then removes it
exports.delete = async function(req, res) {
  const { thread_id, delete_password } = req.body
  const board = req.params.board;

  let passwordMatches = false;
  let deleted = false;

  await Thread.findById(thread_id)
    .then(async (thread) => {
      passwordMatches = await hash.compareHash(delete_password, thread.delete_password);

      // Delete the thread if the password is correct
      if (passwordMatches === true) {
        await Thread.deleteOne(thread._id)
          .then((deletedThread) => {
            deleted = true;
          })
          .catch((err) => {
            console.error(err);
            deleted = false;
          });
      };
    })
    .catch((err) => {
      console.error(err);
      passwordMatches = false;
      deleted = false;
    });
  
  if (deleted) {
    return res.send("success");
  } else {
    return res.send("incorrect password");
  };
};

// PUT Function that changes the value of 'reported' to true
exports.put = async function(req, res) {
  const thread_id = req.body.thread_id;

  await Thread.findByIdAndUpdate(thread_id, { $set: { reported: true } })
    .then((updated) => {
    })
    .catch((err) => {
      console.error(err);
    });

  return res.send("reported");
};