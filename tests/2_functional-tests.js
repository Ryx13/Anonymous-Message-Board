/*
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require('chai-http');
const chai     = require('chai');
const assert   = chai.assert;
const server   = require('../server');

chai.use(chaiHttp);

let thread_id;
let reply_id;
const delete_password = 'pass';

suite('Functional Tests', function () {

  suite('API ROUTING FOR /api/threads/:board', function () {

    suite('POST', function () {
      test('Creating a new thread: POST request to /api/threads/{board}', function (done) {
        chai.request(server)
          .post('/api/threads/fcc_test')
          .send({ text: 'test text', delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            thread_id = res.body._id;
            done();
          });
      });
    });

    suite('GET', function () {
      test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
        chai.request(server)
          .get('/api/threads/fcc_test')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            assert.isAtMost(res.body[0].replies.length, 3);
            done();
          });
      });
    });

    suite('DELETE', function () {
      test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
        chai.request(server)
          .delete('/api/threads/fcc_test')
          .send({ thread_id, delete_password: 'wrong' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });

      test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
        chai.request(server)
          .delete('/api/threads/fcc_test')
          .send({ thread_id, delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });

    suite('PUT', function () {
      test('Reporting a thread: PUT request to /api/threads/{board}', function (done) {
        chai.request(server)
          .post('/api/threads/fcc_test')
          .send({ text: 'report me', delete_password })
          .end((err, res) => {
            const id = res.body._id;
            chai.request(server)
              .put('/api/threads/fcc_test')
              .send({ thread_id: id })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
              });
          });
      });
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function () {

    suite('POST', function () {
      test('Creating a new reply: POST request to /api/replies/{board}', function (done) {
        chai.request(server)
          .post('/api/threads/fcc_test')
          .send({ text: 'thread for reply', delete_password })
          .end((err, res) => {
            const threadId = res.body._id;
            chai.request(server)
              .post('/api/replies/fcc_test')
              .send({ thread_id: threadId, text: 'test reply', delete_password })
              .end((err, res) => {
                assert.equal(res.status, 200);
                reply_id = res.body._id;
                thread_id = threadId;
                done();
              });
          });
      });
    });

    suite('GET', function () {
      test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
        chai.request(server)
          .get('/api/replies/fcc_test')
          .query({ thread_id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'text');
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            assert.property(res.body.replies[0], 'text');
            done();
          });
      });
    });

    suite('PUT', function () {
      test('Reporting a reply: PUT request to /api/replies/{board}', function (done) {
        chai.request(server)
          .put('/api/replies/fcc_test')
          .send({ thread_id, reply_id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
      });
    });

    suite('DELETE', function () {
      test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function (done) {
        chai.request(server)
          .delete('/api/replies/fcc_test')
          .send({ thread_id, reply_id, delete_password: 'wrong' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });

      test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function (done) {
        chai.request(server)
          .delete('/api/replies/fcc_test')
          .send({ thread_id, reply_id, delete_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
  });
});