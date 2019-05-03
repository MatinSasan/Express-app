const path = require('path');

const express = require('express');
const parser = require('body-parser');
// const expressHbs = require('express-handlebars');

const errorController = require('./controllers/error');

const app = express();

// app.engine(
//   'hbs',
//   expressHbs({
//     layoutsDir: 'views/layouts',
//     defaultLayout: 'main-layout',
//     extname: 'hbs'
//   })
// );
app.set('view engine', 'ejs'); // 'pug' or 'hbs'
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(parser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000, () => console.log('...is listening'));
