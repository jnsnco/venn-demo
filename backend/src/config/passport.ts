import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { query } from './database';

interface OAuthProfile {
  provider: string;
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
}

async function findOrCreateUser(profile: OAuthProfile) {
  const email = profile.emails[0]?.value;
  if (!email) throw new Error('No email found in OAuth profile');

  // Check if user exists
  const existing = await query(
    'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
    [profile.provider, profile.id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Create new user
  const result = await query(
    `INSERT INTO users (email, name, avatar, oauth_provider, oauth_id, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      email,
      profile.displayName,
      profile.photos?.[0]?.value || null,
      profile.provider,
      profile.id,
      'user', // Default role
    ]
  );

  return result.rows[0];
}

// Google OAuth
if (process.env.OAUTH_GOOGLE_CLIENT_ID && process.env.OAUTH_GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            provider: 'google',
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails || [],
            photos: profile.photos,
          });
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

// GitHub OAuth
if (process.env.OAUTH_GITHUB_CLIENT_ID && process.env.OAUTH_GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const user = await findOrCreateUser({
            provider: 'github',
            id: profile.id,
            displayName: profile.displayName || profile.username,
            emails: profile.emails || [],
            photos: profile.photos,
          });
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error);
  }
});

export default passport;
