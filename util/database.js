const mongoDb = require('mongodb');
const MongoClient = mongoDb.MongoClient;

const { username, pass, myCluster } = require('../config');

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb+srv://${username}:${pass}@${myCluster}.mongodb.net/test?retryWrites=true`,
    { useNewUrlParser: true }
  )
    .then(client => {
      console.log('\nconnected\n');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log('\nerror\n', err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'NO DATABASE FOUND';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
