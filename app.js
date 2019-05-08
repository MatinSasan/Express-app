const path = require('path');

const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');

const { username, pass, myCluster } = require('./config');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(parser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5cd2af09d1279f2e3c23ce2a')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${username}:${pass}@${myCluster}.mongodb.net/shop?retryWrites=true`,
    { useNewUrlParser: true },
    err => console.log(err)
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Joe',
          email: 'test@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000, () => console.log('listening...'));
  })
  .catch(err => console.log(err));
