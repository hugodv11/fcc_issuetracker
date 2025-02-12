const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let issueIds = [];

  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'test title',
        issue_text: 'test text',
        created_by: 'test',
        assigned_to: 'test',
        status_text: 'test',
      })

      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'test title');
        assert.equal(res.body.issue_text, 'test text');
        assert.equal(res.body.created_by, 'test');
        assert.equal(res.body.assigned_to, 'test');
        assert.equal(res.body.status_text, 'test');

        issueIds.push(res.body._id);

        done();
      });
  });
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'test2 title',
        issue_text: 'test2 text',
        created_by: 'test2',
      })

      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'test2 title');
        assert.equal(res.body.issue_text, 'test2 text');
        assert.equal(res.body.created_by, 'test2');

        issueIds.push(res.body._id);
        done();
      });
  });
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'test title',
        issue_text: 'test text',
      })

      .end(function (err, res) {
        assert.equal(res.body.error, 'required field(s) missing');

        done();
      });
  });
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .end(function (err, res) {
        assert.isArray(res.body);
        assert.isAbove(res.body.length, 0);
        assert.isAtLeast(res.body.length, 2);
        done();
      });
  });
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/apitest?created_by=test')
      .end(function (err, res) {
        assert.isArray(res.body);
        assert.isAbove(res.body.length, 0);
        assert.include(res.body.map(i => (i._id)), issueIds[0]);
        done();
      });
  });
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/apitest?created_by=test2&issue_text=test2 text')
      .end(function (err, res) {
        assert.isArray(res.body);
        assert.isAbove(res.body.length, 0);
        assert.include(res.body.map(i => (i._id)), issueIds[1]);
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: issueIds[0],
        assigned_to: 'test3',
      })

      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueIds[0]);

        done();
      });
  });
  test(' Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: issueIds[1],
        assigned_to: 'test4',
        issue_text: 'test4 text'
      })
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueIds[1]);

        done();
      });
  });
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        assigned_to: 'test4',
        issue_text: 'test4 text'
      })
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: issueIds[1],
      })
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'no update field(s) sent')
        assert.equal(res.body._id, issueIds[1])

        done();
      });
  });
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: '213456456734356789021234',
        assigned_to: 'test4',
        issue_text: 'test4 text'
      })
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'could not update')
        assert.equal(res.body._id, '213456456734356789021234')

        done();
      });
  });
  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: issueIds[0],
      })
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, 'successfully deleted')
        assert.equal(res.body._id, issueIds[0])

        done();
      });
  });
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: '213456456734356789021234',
      })
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'could not delete')
        assert.equal(res.body._id, '213456456734356789021234')

        done();
      });
  });
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .end(function (err, res) {
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'missing _id')

        done();
      });
  });
});
