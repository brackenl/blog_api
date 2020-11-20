const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

var User = require("../models/user");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
  User.findById(jwt_payload.id, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (user) {
      return done(null, true);
    }
    return done(null, false);
  });
});
