// user ROUTES

const express = require('express');
var passport = require('passport');
const router = new express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// root level
router.get('/', async function(req, res) {
    res.render('index.html');
})

// CREATE (REGISTER)
router.post('/users', async function(req, res) {
    try {
        var user = new User(req.body);
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = await bcrypt.hash(req.body.password, 8);
        await user.save(); 
        res.send({ message: 'saved to database' });
    } catch (e) {
        res.status(400).send(e);
    }
})

// LOGIN
const passportJWT = require('passport-jwt');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'secretKey';

var strategy = new JwtStrategy(jwtOptions, async function(payload, next) {
    // console.log('payload received', payload);
    let user = await User.findById(payload.id);    
    if (user)
        next(null, user);
    else
        next(null, false);
})

passport.use(strategy);


router.post('/login', async function(req, res) {
    let email = req.body.email;
    let plainTextPassword = req.body.password;
    try {
        let user = await User.findOne({ email: email });
        // console.log(user);
        if (!user)
            res.status(404).json({message: 'User not found.'});

        let match = await bcrypt.compare(plainTextPassword, user.password);

        if (!match)
            return console.log('Passwords do not match.');
            
        // success
        var payload = { id: user._id };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({ message: 'ok', token: token });
    } catch (e) {
        res.status(500).send(e);
    } 
});

// READ ALL USERS - for logged in users only
router.get('/users', async function(req, res) {
    try {
        let users = await User.find();
        res.send(users);
    } catch (e) {
        res.send(500).json({ message: "Must log in." });
    }
});

// SECRET ROUTE
// router.get('/secret', passport.authenticate('jwt', { session: false }), function(req, res) {
router.get('/secret', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        let response = await req.get('Authorization');
        console.log(response);
        res.json({ "message": "Success. You cannot see this message without a token." });
    } catch (e) {
        res.status(500).send(e);
    }
});

// DELETE
router.delete('/users/:id', async function(req, res) {
    try {
        let id = req.params.id;
        let user = await User.findByIdAndDelete(id);
        res.send(user);
    } catch (e) {
        res.status(404).send(e);
    }
});

module.exports = router;