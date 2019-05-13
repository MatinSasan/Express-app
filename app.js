const path = require('path');

const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');

const { username, pass, myCluster } = require('./config');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MongoDB_URI = `mongodb+srv://${username}:${pass}@${myCluster}.mongodb.net/shop?retryWrites=true`;

const app = express();
const store = new mongoDBStore({
  uri: MongoDB_URI,
  collection: 'sessions'
});
const csrfProtect = csurf();

app.set('view engine', 'ejs');
app.set('views', 'views');

// ROUTES

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutess = require('./routes/auth');

//

app.use(parser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtect);
app.use(flash());

// AUTH TOKEN

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// USER

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

// using routes

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutess);

//

app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  // res.redirect('/500');
  res.status(500).render('500', {
    title: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

mongoose
  .connect(MongoDB_URI, { useNewUrlParser: true }, err => console.log(err))
  .then(result => {
    app.listen(3000, () => console.log('listening...'));
  })
  .catch(err => console.log(err));
