const mongoDb = require('mongodb');
const MongoClient = mongoDb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://matin:admin@cluster0-zh1eb.mongodb.net/test?retryWrites=true'
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
