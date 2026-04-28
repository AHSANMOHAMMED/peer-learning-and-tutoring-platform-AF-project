const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Extract role from state if present
          let role = 'student';
          if (req.query.state) {
            try {
              const state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
              if (state.role) role = state.role;
            } catch (e) {
              console.error('Error parsing OAuth state:', e);
            }
          }

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isVerified = true;
            if (!user.profile.avatar && profile.photos[0]) {
              user.profile.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user from Google profile
          const username = profile.displayName.toLowerCase().replace(/\s+/g, '') + '_' + Date.now().toString().slice(-4);
          
          user = await User.create({
            googleId: profile.id,
            username,
            email: profile.emails[0].value,
            password: require('crypto').randomBytes(32).toString('hex'), // Random secure password
            role: role,
            isVerified: true,
            authProvider: 'google',
            profile: {
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              avatar: profile.photos[0]?.value,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️  Google OAuth credentials missing. Google Login will be disabled.');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
