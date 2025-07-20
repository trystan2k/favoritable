# Logging System Implementation

This document provides detailed technical information about the logging system implementation in the Favoritable API.

## Architecture Overview

The logging system is built on [Pino](https://github.com/pinojs/pino), a fast JSON logger for Node.js, with custom middleware and configuration for HTTP request logging and security.

### Core Components

```
src/core/
├── logger.ts          # Main logger configuration and exports
└── http.logger.ts     # HTTP request/response logging middleware
```

## Core Logger Implementation

### Configuration

The logger configuration adapts based on the `NODE_ENV`:

```typescript
const getLoggerConfig = () => {
  const isProduction = env.NODE_ENV === NodeEnvs.PRODUCTION;
  const isDevelopment = env.NODE_ENV === NodeEnvs.DEVELOPMENT;

  return {
    level: process.env.LOG_LEVEL || (isProduction ? LogLevels.INFO : LogLevels.DEBUG),
    redact: {
      paths: REDACT_FIELDS,
      censor: '[REDACTED]'
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: isDevelopment ? prettyPrintTransport : undefined,
  };
};
```

#### Security - Sensitive Data Redaction

The system automatically redacts sensitive fields from log output:

```typescript
const REDACT_FIELDS = [
  'password', 'token', 'authorization', 'cookie', 'secret', 'key',
  'apiKey', 'api_key', 'access_token', 'refresh_token', 
  'credit_card', 'creditCard',
  'req.headers.authorization', 'req.headers.cookie'
];
```

Any log object containing these fields will have their values replaced with `[REDACTED]`.

### Logger Factory

The system provides multiple ways to create logger instances:

```typescript
// Base logger - raw Pino instance
export const baseLogger = pino(getLoggerConfig());

// Context logger factory
export const createLogger = (context: string) => {
  return baseLogger.child({ context });
};

// Default application logger
export const logger = createLogger('app');
```

### Log Levels

```typescript
export const LogLevels = {
  FATAL: 'fatal',    // 60 - System unusable
  ERROR: 'error',    // 50 - Error conditions  
  WARN: 'warn',      // 40 - Warning conditions
  INFO: 'info',      // 30 - Informational
  DEBUG: 'debug',    // 20 - Debug information
  TRACE: 'trace',    // 10 - Trace information
  SILENT: 'silent'   // Infinity - Disable logging
} as const;
```

## HTTP Logging Middleware

### Request/Response Logging

The HTTP logger middleware (`loggerMiddleware`) provides:

1. **Request ID Generation**: Each request gets a unique identifier for tracing
2. **Context Injection**: Logger instance with request ID is available in route handlers
3. **Automatic Logging**: Request start/completion with appropriate log levels
4. **Performance Metrics**: Request duration tracking

### Implementation Details

```typescript
export const loggerMiddleware = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestLogger = createLogger('http');
    const requestId = crypto.randomUUID();
    
    // Inject logger and request ID into context
    c.set('requestId', requestId);
    c.set('logger', requestLogger.child({ requestId }));

    // Log incoming request (DEBUG level)
    requestLogger.debug({
      requestId, method, path, headers, query,
      msg: 'Incoming request'
    });

    try {
      await next();
      // Log successful completion with duration
      const duration = Date.now() - startTime;
      const logLevel = determineLogLevel(c.res.status);
      requestLogger[logLevel]({
        requestId, method, path, status, duration: `${duration}ms`,
        msg: `Request completed - ${method} ${path} ${status} ${duration}ms`
      });
    } catch (error) {
      // Log failed requests
      requestLogger.error({
        requestId, method, path, error: serializeError(error),
        msg: `Request failed - ${method} ${path}`
      });
      throw error;
    }
  };
};
```

### Log Level Determination

Response status codes are automatically mapped to log levels:

- `200-299`: `info` - Successful requests
- `300-399`: `debug` - Redirects (less interesting for monitoring)  
- `400-499`: `warn` - Client errors
- `500-599`: `error` - Server errors

### Request Filtering

Health check and favicon requests are automatically filtered out to reduce noise:

```typescript
autoLogging: {
  ignore: (req) => ['/health', '/favicon.ico'].includes(req.url!)
}
```

## Usage Patterns

### Service Layer Logging

```typescript
// Feature services create contextual loggers
export class BookmarkService {
  async importFromHtmlFile(htmlContent: string, userId: string) {
    const serviceLogger = logger.child({ 
      context: 'BookmarkService', 
      method: 'importFromHtmlFile',
      userId 
    });
    
    serviceLogger.info('Starting HTML file import', { 
      contentLength: htmlContent.length 
    });
    
    try {
      // Process...
      serviceLogger.info('HTML import completed successfully', { 
        bookmarksImported: bookmarks.length 
      });
      return bookmarks;
    } catch (error) {
      serviceLogger.error('HTML import failed', { error });
      throw error;
    }
  }
}
```

### Error Handling Integration

The error handlers use structured logging to track error context:

```typescript
export const notFoundHandler = (c: Context) => {
  const requestLogger = logger.child({ 
    context: 'ErrorHandler',
    requestId: c.get('requestId'),
    method: c.req.method,
    path: c.req.path
  });
  
  requestLogger.warn('Resource not found', {
    requestedUrl: c.req.url,
    userAgent: c.req.header('User-Agent')
  });
  
  return c.json({ message: 'Not Found' }, 404);
};
```

## Environment-Specific Behavior

### Development Mode

- **Pretty Printing**: Colorized, human-readable output via `pino-pretty`
- **Debug Level**: All log messages including debug/trace
- **Detailed Context**: Full headers, query params, and request bodies

### Production Mode  

- **JSON Output**: Structured logs for aggregation systems (ELK, Splunk, etc.)
- **Info Level**: Business events and errors only
- **Optimized Performance**: Minimal formatting overhead
- **Security**: Automatic redaction of sensitive data

## Performance Considerations

### Why Pino?

Pino is chosen for its exceptional performance characteristics:

- **Minimal Overhead**: Asynchronous logging with worker threads
- **JSON Native**: No string concatenation or formatting overhead  
- **Serialization**: Efficient object serialization
- **Benchmarks**: ~10x faster than Winston, ~3x faster than Bunyan

### Memory Usage

- **Child Loggers**: Reuse base configuration, minimal memory overhead
- **Circular References**: Automatic handling without memory leaks
- **Stream Management**: Proper cleanup and resource management

## Integration with Monitoring

### Log Aggregation

The structured JSON format integrates seamlessly with:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **DataDog**  
- **New Relic**
- **CloudWatch** (AWS)
- **Stackdriver** (GCP)

### Key Fields for Monitoring

Standard fields included in all logs:

```typescript
{
  "time": "2024-01-15T10:30:00.000Z",     // ISO timestamp
  "level": "info",                         // Log level
  "context": "BookmarkService",            // Logger context
  "msg": "Bookmark created successfully",  // Human readable message
  "requestId": "uuid-v4",                  // Request correlation ID
  "userId": "user123",                     // User context (if available)
  // ... custom fields
}
```

### Alerting Queries

Common queries for setting up alerts:

```javascript
// Error rate spike
level:"error" AND context:"*Service"

// Slow requests  
duration:>5000 AND level:"info" AND msg:"Request completed"

// Authentication failures
level:"warn" AND msg:"*authentication*"

// Database errors
level:"error" AND msg:"*database*"
```

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check `LOG_LEVEL` environment variable
2. **Pretty printing in production**: Ensure `NODE_ENV=production`
3. **Sensitive data in logs**: Verify redaction fields cover all sensitive keys
4. **Performance impact**: Consider raising log level in high-traffic scenarios

### Debugging

Enable trace-level logging temporarily:

```bash
LOG_LEVEL=trace pnpm dev
```

### Log Analysis

Use `jq` for analyzing JSON logs:

```bash
# Extract all error messages
cat api.log | jq 'select(.level == "error") | .msg'

# Request duration analysis
cat api.log | jq 'select(.duration) | .duration' | sort -n

# User activity tracking
cat api.log | jq 'select(.userId) | {time, userId, msg}'
```