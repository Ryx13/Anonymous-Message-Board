// mock-db.js
const mockData = {
  threads: [],
  replies: []
};

const addThread = (thread) => {
  mockData.threads.push(thread);
  return thread;
};

const getThreads = () => {
  return mockData.threads;
};

const addReply = (reply) => {
  mockData.replies.push(reply);
  return reply;
};

const getReplies = () => {
  return mockData.replies;
};

module.exports = {
  addThread,
  getThreads,
  addReply,
  getReplies
};