import {Mongo} from 'meteor/mongo';

export const Records = new Mongo.Collection('records');

Records.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
});