import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import { account } from './db/schema/account.schema.js';
import { session } from './db/schema/session.schema.js';
import { user } from './db/schema/user.schema.js';
import { verification } from './db/schema/verification.schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite', // Using libsql/sqlite
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
    },
  },
  trustedOrigins: ['https://appleid.apple.com'],
  advanced: {
    cookiePrefix: 'fav',
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      partitioned: true, // New browser standards will mandate this for foreign cookies
    },
  },
  telemetry: { enabled: false },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
});
