var JwtStrategy = require('passport-jwt').Strategy;

var config = require('clickberry-config');
var error=require('clickberry-http-errors');

module.exports = function (passport) {
    passport.use('access-token', new JwtStrategy({
        secretOrKey: config.get('token:accessSecret')
    }, function (jwtPayload, done) {
        if(jwtPayload.role=='admin'){
            done(null, jwtPayload);
        }else{
            done(new error.Forbidden());
        }
    }));
};

