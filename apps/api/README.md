# Favoritable API

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
