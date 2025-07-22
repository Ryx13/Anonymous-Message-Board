const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let threadId = "";
let replyId = "";

suite('Functional Tests', function() {

  test("Creating a new thread", function(done) {
    chai.request(server)
      .post("/api/threads/func-test")
      .send({ text: "func-test", delete_password: "func-test"})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each", function(done) {
    chai.request(server)
      .get("/api/threads/func-test")
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.body, "array");
        threadId = res.body[0]._id;
        done();
      });
  });

  test("Reporting a thread", function(done) {
    chai.request(server)
      .put("/api/threads/func-test")
      .send({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.text, "string");
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Creating a new reply", function(done) {
    chai.request(server)
      .post("/api/replies/func-test")
      .send({ text: "func-test", delete_password: "func-test", thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  test("Viewing a single thread with all replies", function(done) {
    chai.request(server)
      .get("/api/threads/func-test")
      .query({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        replyId = res.body[0].replies[0]._id;
        done();
      });
  });

  test("Reporting a reply", function(done) {
    chai.request(server)
      .put("/api/threads/func-test")
      .query({ thread_id: threadId, reply_id: replyId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.text, "string");
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Deleting a reply with the incorrect password", function(done) {
    chai.request(server)
      .delete("/api/replies/func-test")
      .send({ thread_id: threadId, reply_id: replyId, delete_password: "INCORRECT" })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.text, "string");
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("Deleting a reply with the correct password", function(done) {
    chai.request(server)
      .delete("/api/replies/func-test")
      .send({ thread_id: threadId, reply_id: replyId, delete_password: "func-test" })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.text, "string");
        assert.equal(res.text, "success");
        done();
      });
  });

  test("Deleting a thread with the incorrect password", function(done) {
    chai.request(server)
      .delete("/api/threads/func-test")
      .send({ thread_id: threadId, delete_password: "INCORRECT" })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.text, "string");
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("Deleting a thread with the correct password", function(done) {
    chai.request(server)
      .delete("/api/threads/func-test")
      .send({ thread_id: threadId, delete_password: "func-test" })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.text, "string");
        assert.equal(res.text, "success");
        done();
      });
  });

  after(function() {
    chai.request(server).get("/api");
  });
  
});