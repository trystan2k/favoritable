# Favoritable API

## Database Setup (Turso)

The API uses Turso (managed SQLite) as the primary database. Follow these steps to set up the database for local development:

### 1. Sign up for Turso

1. Go to [https://turso.tech/](https://turso.tech/)
2. Create a new account
3. Create a new database instance for your project

### 2. Get Database Credentials

After creating your database instance:

1. Get your database URL (format: `libsql://your-db-name.region.turso.io`)
2. Generate an authentication token from the Turso dashboard

### 3. Configure Environment Variables

Create or update the `.env` file in the API directory:

```env
TURSO_DATABASE_URL=libsql://your-db-name.region.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

⚠️ **Important**: The `.env` file is already included in `.gitignore` to prevent committing sensitive credentials.

### 4. Verify Database Connection

Test your database connection:

```bash
pnpm run db:health
```

This will run a connection test and confirm that your database setup is working correctly.

### 5. Database Schema

The database schema is managed using Drizzle ORM. Schema files are located in `src/db/schema/`. To push schema changes to Turso:

```bash
pnpm exec drizzle-kit push
```

### Available Database Commands

- `pnpm run db:health` - Test database connection
- `pnpm exec drizzle-kit push` - Push schema changes to database
- `pnpm exec drizzle-kit generate` - Generate migration files
- `pnpm exec drizzle-kit migrate` - Run migrations

## OAuth Provider Configuration

The API supports authentication via multiple OAuth providers: GitHub, Google, Facebook, Twitter/X, and Apple. Each provider requires registration and configuration.

### Environment Variables

Copy `.env.example` to `.env` and configure the OAuth providers you want to support:

```bash
cp .env.example .env
```

### Provider Setup Instructions

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App
3. Set Authorization callback URL to: `https://your-domain.com/api/auth/callback/github`
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to your `.env` file

#### Google OAuth  

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your `.env` file

#### Facebook OAuth

1. Go to [Meta for Developers](https://developers.facebook.com/apps/)
2. Create a new app and set up Facebook Login
3. Add redirect URI: `https://your-domain.com/api/auth/callback/facebook`
4. Add `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` to your `.env` file

#### Twitter/X OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app with OAuth 2.0 enabled
3. Add callback URI: `https://your-domain.com/api/auth/callback/twitter`
4. Add `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` to your `.env` file

#### Apple OAuth (Advanced)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Create a Services ID and enable Sign in with Apple
3. Configure domains and return URLs: `https://your-domain.com/api/auth/callback/apple`
4. Generate a private key (.p8 file) for JWT signing
5. Add `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY_PATH` to your `.env` file

### OAuth Callback URLs

The API automatically handles OAuth callbacks at these endpoints:

- `GET /api/auth/callback/github`
- `GET /api/auth/callback/google`
- `GET /api/auth/callback/facebook`
- `GET /api/auth/callback/twitter`
- `GET /api/auth/callback/apple`

### Security Notes

- Environment variables containing secrets should never be committed to version control
- Use your deployment platform's environment variable management for production
- The API uses PKCE (Proof Key for Code Exchange) for enhanced security
- All OAuth sessions are automatically managed by Better Auth

## Logging System

The API uses a structured logging system built on top of Pino for high-performance, structured JSON logging. The logger automatically handles sensitive data redaction, environment-specific formatting, and request tracing.

### Basic Usage

```typescript
import { logger } from './core/logger.js';

// Basic logging levels
logger.info('User action completed successfully');
logger.warn('Deprecated API endpoint used');
logger.error('Database connection failed', { error: err });
logger.debug('Detailed processing information', { userId: '123', step: 'validation' });
```

### Available Log Levels

- `fatal` - System is unusable (automatic process exit)
- `error` - Error conditions that need attention
- `warn` - Warning conditions that might cause issues
- `info` - General information (business events)
- `debug` - Detailed information for debugging
- `trace` - Very detailed information
- `silent` - No logging

### Creating Contextual Loggers

```typescript
import { createLogger } from './core/logger.js';

// Create a service-specific logger
const serviceLogger = createLogger('BookmarkService');
serviceLogger.info('Bookmark created successfully', { bookmarkId: 'abc123' });

// Create method-specific logger with additional context
const methodLogger = logger.child({ 
  context: 'BookmarkService', 
  method: 'importFromHtmlFile',
  userId: '123'
});
methodLogger.debug('Processing HTML file', { fileSize: 1024 });
```

### HTTP Request Logging

HTTP requests are automatically logged using the `loggerMiddleware`. Each request gets:

- Unique request ID for tracing
- Method, path, headers, and query parameters
- Response status and duration
- Automatic log level based on status code (info for 2xx, warn for 4xx, error for 5xx)

```typescript
// Access request logger in route handlers
app.get('/bookmarks', async (c) => {
  const requestLogger = getRequestLogger(c);
  requestLogger.info('Fetching bookmarks', { userId: c.get('userId') });
  
  return c.json(bookmarks);
});
```

### Security Features

The logger automatically redacts sensitive information from logs:

- Passwords, tokens, API keys
- Authorization headers and cookies  
- Credit card information
- Any field containing variations of "secret", "key", "token", "password"

### Environment Configuration

The logger adapts based on the environment:

- **Development**: Pretty-printed colorized output with detailed information
- **Production**: Structured JSON output optimized for log aggregation
- **Log Level**: Controlled via `LOG_LEVEL` environment variable (defaults to INFO in production, DEBUG in development)

### Best Practices

1. **Use appropriate log levels**:
   - `info` for business events (user actions, service operations)
   - `debug` for detailed technical information
   - `warn` for recoverable issues
   - `error` for serious problems

2. **Include context**:

   ```typescript
   logger.info('Bookmark imported successfully', {
     bookmarkId: bookmark.id,
     userId: user.id,
     source: 'html_file',
     count: bookmarks.length
   });
   ```

3. **Use child loggers for context**:

   ```typescript
   const operationLogger = logger.child({ 
     operation: 'bulk_import',
     requestId: c.get('requestId')
   });
   ```

4. **Don't log sensitive data** - The system handles this automatically, but be mindful of what you include in log context.

For detailed implementation information, see [docs/logging.md](../docs/logging.md).

## Docker Deployment

The API includes a production-ready Docker configuration with multi-stage builds and Puppeteer support.

### Building the Docker Image

Build the Docker image from the project root:

```bash
# Build the image
docker build -f apps/api/Dockerfile -t favoritable-api .

# Build with a specific tag
docker build -f apps/api/Dockerfile -t favoritable-api:latest .
```

### Running the Container

#### Local Development with SQLite

```bash
# Run with local SQLite database
docker run -d \
  --name favoritable-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_TYPE=local \
  -e LOCAL_DATABASE_URL=file:/app/data/local.db \
  -v $(pwd)/data:/app/data \
  favoritable-api:latest
```

#### Production with Turso

```bash
# Run with Turso database
docker run -d \
  --name favoritable-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_TYPE=turso \
  -e TURSO_DATABASE_URL=libsql://your-db-name.region.turso.io \
  -e TURSO_AUTH_TOKEN=your_auth_token_here \
  favoritable-api:latest
```

#### Using Environment File

Create a `.env.production` file with database and OAuth configuration:

```env
NODE_ENV=production
DATABASE_TYPE=turso
TURSO_DATABASE_URL=libsql://your-db-name.region.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here

# OAuth providers (configure as needed)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Add other OAuth providers as needed...
```

Then run with the environment file:

```bash
docker run -d \
  --name favoritable-api \
  -p 3000:3000 \
  --env-file .env.production \
  favoritable-api:latest
```

### Docker Commands

Available npm scripts for Docker operations:

```bash
# Build Docker image
pnpm docker:build

# Run Docker container locally
pnpm docker:run

# Stop and remove container
pnpm docker:stop

# View container logs
pnpm docker:logs
```

### Container Health Check

The container includes a built-in health check that verifies the API is responding:

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' favoritable-api
```

### Testing the Container

After starting the container, test that it's working correctly:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/api/bookmarks
```

### Container Features

- **Multi-stage build**: Optimized final image size
- **Puppeteer support**: All system dependencies included for web scraping
- **Security**: Runs as non-root user
- **Health checks**: Built-in container health monitoring
- **Production optimized**: Only production dependencies included
