const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const config = require('../config');
const { User } = require('../models');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackUrl,
      scope: ['user:email', 'repo'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;
        const avatarUrl = profile.photos?.[0]?.value || null;

        let user = await User.findByGithubId(profile.id);

        if (user) {
          user = await User.update(user.id, {
            username: profile.username,
            email,
            avatar_url: avatarUrl,
            display_name: profile.displayName || profile.username,
          });
        } else {
          user = await User.create({
            github_id: profile.id,
            username: profile.username,
            email,
            avatar_url: avatarUrl,
            display_name: profile.displayName || profile.username,
          });
        }

        user.accessToken = accessToken;
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
