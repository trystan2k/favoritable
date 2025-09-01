# OAuth Providers Setup Guide

This guide provides step-by-step instructions for configuring OAuth providers for the Favoritable application.

## Prerequisites

- A deployed application URL (for production) or `http://localhost:3000` (for development)
- Access to each provider's developer console

## Environment Variables

After configuring each provider, add the credentials to your `.env` file:

```bash
# Copy from .env.example and fill in the values
cp .env.example .env
```

---

## 1. Google OAuth Setup

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/auth/google/callback`
     - Production: `https://yourdomain.com/auth/google/callback`

### Environment Variables:
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Required Scopes:
- `profile` (basic profile information)
- `email` (email address)

---

## 2. Facebook OAuth Setup

### Steps:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product to your app
4. Configure Facebook Login settings:
   - Go to "Facebook Login" > "Settings"
   - Add Valid OAuth Redirect URIs:
     - Development: `http://localhost:3000/auth/facebook/callback`
     - Production: `https://yourdomain.com/auth/facebook/callback`
5. Get your App ID and App Secret from "Settings" > "Basic"

### Environment Variables:
```bash
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

### Required Permissions:
- `email` (email address)
- `public_profile` (basic profile information)

---

## 3. GitHub OAuth Setup

### Steps:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Favoritable
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:3000` for dev)
   - **Authorization callback URL**:
     - Development: `http://localhost:3000/auth/github/callback`
     - Production: `https://yourdomain.com/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and generate a new Client Secret

### Environment Variables:
```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Required Scopes:
- `user:email` (email addresses)
- `read:user` (basic profile information)

---

## 4. Apple OAuth Setup

### Steps:
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Sign in with your Apple Developer account (requires paid membership)
3. Go to "Certificates, Identifiers & Profiles"
4. Create a new App ID:
   - Go to "Identifiers" > "App IDs"
   - Click the "+" button
   - Select "App" and continue
   - Fill in description and Bundle ID
   - Enable "Sign In with Apple" capability
5. Create a Service ID:
   - Go to "Identifiers" > "Services IDs"
   - Click the "+" button
   - Fill in description and identifier
   - Enable "Sign In with Apple"
   - Configure domains and redirect URLs:
     - Development: `http://localhost:3000/auth/apple/callback`
     - Production: `https://yourdomain.com/auth/apple/callback`
6. Create a private key:
   - Go to "Keys"
   - Click the "+" button
   - Enable "Sign In with Apple"
   - Download the private key file (.p8)

### Environment Variables:
```bash
APPLE_CLIENT_ID=your_service_id
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Content\n-----END PRIVATE KEY-----
```

### Required Information:
- **Client ID**: Your Service ID
- **Team ID**: Found in your Apple Developer account
- **Key ID**: From the private key you created
- **Private Key**: Content of the .p8 file (replace newlines with \n)

---

## 5. Twitter (X) OAuth Setup

### Steps:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app (or use existing)
3. Go to your app settings
4. Navigate to "Authentication settings"
5. Enable "OAuth 1.0a" and/or "OAuth 2.0"
6. Set up callback URLs:
   - Development: `http://localhost:3000/auth/twitter/callback`
   - Production: `https://yourdomain.com/auth/twitter/callback`
7. Get your API Key and API Secret Key from "Keys and tokens" tab

### Environment Variables:
```bash
TWITTER_CLIENT_ID=your_twitter_api_key
TWITTER_CLIENT_SECRET=your_twitter_api_secret_key
```

### Required Permissions:
- Read user profile information
- Read email address (requires additional approval from Twitter)

**Note**: Email access requires special permission from Twitter and may not be immediately available.

---

## Testing Your OAuth Setup

### 1. Development Testing
1. Start your development server: `pnpm dev`
2. Navigate to each OAuth endpoint:
   - Google: `http://localhost:3000/auth/google`
   - Facebook: `http://localhost:3000/auth/facebook`
   - GitHub: `http://localhost:3000/auth/github`
   - Apple: `http://localhost:3000/auth/apple`
   - Twitter: `http://localhost:3000/auth/twitter`

### 2. Verify Callback URLs
Ensure all callback URLs are correctly configured in both:
- Your OAuth provider settings
- Your application configuration

### 3. Common Issues
- **Redirect URI mismatch**: Ensure URLs match exactly (including trailing slashes)
- **Domain verification**: Some providers require domain verification for production
- **HTTPS requirement**: Most providers require HTTPS in production
- **Scope permissions**: Ensure you've requested the necessary scopes/permissions

---

## Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Domain Validation**: Verify domain ownership where required
4. **Regular Rotation**: Rotate secrets periodically
5. **Minimal Scopes**: Only request the minimum required permissions
6. **Secure Storage**: Store secrets securely in production (use services like AWS Secrets Manager, Azure Key Vault, etc.)

---

## Production Deployment Checklist

- [ ] All OAuth apps configured with production domain
- [ ] HTTPS enabled and certificates valid
- [ ] Environment variables set in production environment
- [ ] Domain verification completed (where required)
- [ ] Callback URLs updated to production URLs
- [ ] Test OAuth flows in production environment
- [ ] Monitor OAuth error logs

---

## Support and Troubleshooting

If you encounter issues:

1. **Check Provider Documentation**: Each provider has detailed documentation
2. **Verify Configuration**: Double-check all URLs and credentials
3. **Check Logs**: Review application and OAuth provider logs
4. **Test Incrementally**: Test one provider at a time

### Useful Links:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Twitter OAuth Documentation](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)