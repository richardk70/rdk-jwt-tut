const User = require('../models/user');
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

module.exports = {
    strategy: strategy, 
    jwtOptions: jwtOptions
}