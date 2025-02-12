'use strict';

const { ObjectId } = require('mongodb');

module.exports = function (app, myDataBase) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.query;
      const query = {};

      if (_id) query._id = ObjectId.createFromHexString(_id);
      if (issue_title) query.issue_title = issue_title;
      if (issue_text) query.issue_text = issue_text;
      if (created_by) query.created_by = created_by;
      if (assigned_to) query.assigned_to = assigned_to;
      if (status_text) query.status_text = status_text;
      if (open) query.open = open == 'true';

      try {
        const issues = await myDataBase.collection(req.params.project).find(query).toArray();

        return res.json(issues);
      } catch (err) {
        console.error(err);
      }
    })

    .post(async function (req, res) {
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) return res.json({ error: "required field(s) missing" });

      try {
        const result = await myDataBase.collection(req.params.project).insertOne({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to ?? '',
          status_text: status_text ?? '',
          open: true,
          created_on: new Date(),
          updated_on: new Date()
        });

        const newIssue = await myDataBase.collection(req.params.project).findOne({ _id: result.insertedId });
        if (!newIssue) return res.json({ error: "Error creating issue" });

        return res.json(newIssue);
      } catch (err) {
        console.error(err);
      }
    })

    .put(async function (req, res) {
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if (!_id) return res.json({ error: "missing _id" });
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open)
        return res.json({ error: 'no update field(s) sent', '_id': _id });

      try {
        const issue = await myDataBase.collection(req.params.project).findOne({ _id: ObjectId.createFromHexString(_id) });
        if (!issue) return res.json({ error: 'could not update', '_id': _id });

        if (issue_title) issue.issue_title = issue_title;
        if (issue_text) issue.issue_text = issue_text;
        if (created_by) issue.created_by = created_by;
        if (assigned_to) issue.assigned_to = assigned_to;
        if (status_text) issue.status_text = status_text;
        if (open) issue.open = open == 'true';

        issue.updated_on = new Date();

        await myDataBase.collection(req.params.project).updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: issue });

        return res.json({ result: 'successfully updated', '_id': _id })
      } catch (err) {
        console.log(err);
      }
    })

    .delete(async function (req, res) {
      const query = {};
      const _id = req.body._id;
      if (!_id) return res.json({ error: 'missing _id' });

      try {
        query._id = ObjectId.createFromHexString(_id);

        const result = await myDataBase.collection(req.params.project).deleteOne(query);
        if (result.deletedCount === 0) return res.json({ error: 'could not delete', '_id': _id });

        return res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        console.log(err);
      }
    });
};
