const path = require('path');

const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(parser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5cd061c048fec22d60041522')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const MongoClient = require('mongodb').MongoClient;
const uri =
  'mongodb+srv://matin:admin@cluster0-zh1eb.mongodb.net/test?retryWrites=true';
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db('test').collection('devices');
  console.log(err);
  // perform actions on the collection object
  client.close();
});

mongoConnect(() => {
  app.listen(3000, () => {
    console.log('is listening...\n');
  });
});
