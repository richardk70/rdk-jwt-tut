// user ROUTES

const express = require('express');
var passport = require('passport');
const router = new express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// token generation
const passportJWT = require('passport-jwt');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET;

var strategy = new JwtStrategy(jwtOptions, async function(payload, next) {
    // console.log('payload received', payload);
    let user = await User.findById(payload.id);    
    if (user)
        next(null, user);
    else
        next(null, false);
})

passport.use(strategy);

// root level
router.get('/', async function(req, res) {
    res.render('index.html');
});

// CREATE (REGISTER)
router.get('/users/register', function(req, res) {
    res.render('register', { locals: { msgExists: '' }});
});

router.post('/users/register', async function(req, res) {
    var pass1 = req.body.password;
    var pass2 = req.body.password2;
    if (pass1 != pass2) {
        res.render('register', {
            locals: { msgExists: 'Passwords do not match.' }
        });
    }
    try {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = await bcrypt.hash(req.body.password, 8);
        user.token = jwt.sign({ id: user._id }, process.env.SECRET);
        await user.save(); 
        res.render('profile', { 
            locals: { msgExists: 'You are now logged in.',
            name: user.name,
            email: user.email,
            token: user.token
         },
     });
    } catch (e) {
        res.status(400).send(e);
    }
})

// LOGIN
router.get('/users/login', function(req, res) {
    res.render('login', { locals: { msgExists: '' }});
});

router.post('/users/login', async function(req, res) {
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
        res.render('profile', {
            locals: {msgExists: `${user.name} w/ token ${token}` }
        })
    } catch (e) {
        res.status(500).send(e);
    } 
});

// READ PROFILE of own account
router.get('/users/me', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        let isLoggedIn = await req.get('Authorization');
        if (!isLoggedIn)
            return console.log('User NOT logged in.');
        
        console.log('User logged in.');
    } catch (e) {
        res.status(500).send(e);
    }
})

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

// READ ALL USERS - for logged in users only
router.get('/users', async function(req, res) {
    try {
        let users = await User.find();
        res.send(users);
    } catch (e) {
        res.send(500).json({ message: "Must log in." });
    }
});

// DELETE 1 user
router.delete('/users/me', async function(req, res) {
    try {
        let id = req.params.id;
        let user = await User.findByIdAndDelete(id);
        res.send(user);
    } catch (e) {
        res.status(404).send(e);
    }
});

// DELETE ALL USERS (admin only)
router.delete('/users', async function(req, res) {
    try {
        let users = await User.remove({});
        res.json({message: "All users removed."});
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;