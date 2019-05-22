// server.js

const express = require('express');
var passport = require('passport');
const es6Render = require('express-es6-template-engine');
var bodyParser = require('body-parser');

const mongoose = require('mongoose');
const userRouter = require('./routes/users');

const User = require('./models/user');

const app = express();

// set up template engine
app.engine('html', es6Render);
app.set('views', './views');
app.set('view engine', 'html');

// set static folder
app.use('/public', express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(userRouter);

// DB CONNECTION
const URL = process.env.MONGO_URI;
const port = process.env.PORT;
mongoose.connect(URL, {useNewUrlParser: true, useCreateIndex: true});

// MIDDLEWARE
// const jwtStrategy = require('./middleware/auth').strategy;

app.listen(port, () => {
    console.log('Listening port ' + port);
});