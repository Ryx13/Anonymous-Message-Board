'use strict';

const threadController = require("../controllers/thread-controller.js");
const replyController = require("../controllers/reply-controller.js");

module.exports = function(app) {

  app.route('/api/threads/:board')
    .post(threadController.post)
    .get(threadController.get)
    .delete(threadController.delete)
    .put(threadController.put);

  app.route('/api/replies/:board')
    .post(replyController.post)
    .get(replyController.get)
    .delete(replyController.delete)
    .put(replyController.put);
};