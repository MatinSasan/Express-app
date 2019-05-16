const path = require('path');

const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const { username, pass, myCluster } = require('./config');

const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');

const MongoDB_URI = `mongodb+srv://${username}:${pass}@${myCluster}.mongodb.net/shop?retryWrites=true`;

const app = express();
const store = new mongoDBStore({
  uri: MongoDB_URI,
  collection: 'sessions'
});
const csrfProtect = csrf();

// MULTER

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

app.set('view engine', 'ejs');
app.set('views', 'views');

// ROUTES

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutess = require('./routes/auth');

//

app.use(parser.urlencoded({ extended: true }));
app.use(upload.single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// CSRF used to be here <---
app.use(flash());

// AUTH TOKEN
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // CSRF middleware used to be here
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

// using routes //
app.post('/create-order', isAuth, shopController.postOrder);

// in order for stripe to work, csrf comes after
app.use(csrfProtect);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// end of csrf //

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutess);

// end of routes //

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render('500', { error: error });
  // res.redirect('/500');
  console.log(error);
  const LoggedIn = req.session.isLoggedIn;

  res.status(500).render('500', {
    title: 'Error!',
    path: '/500',
    isAuthenticated: LoggedIn
  });
});

mongoose
  .connect(MongoDB_URI, { useNewUrlParser: true }, err => console.log(err))
  .then(result => {
    app.listen(3000, () => console.log('listening...'));
  })
  .catch(err => console.log(err));
