# Logging System Documentation

## Overview

This API uses Pino for logging, a high-performance, low-overhead logging library for Node.js. The logging system is designed to provide structured logs with context, making it easier to trace requests, debug issues, and monitor application behavior.

## Key Features

- **Structured JSON Logging**: All logs are in JSON format for easy parsing and analysis
- **Request Tracing**: Each request gets a unique ID that is included in all related logs
- **Context-Aware Logging**: Logs include context information like service name, method, etc.
- **Sensitive Data Redaction**: Automatically redacts sensitive information like passwords, tokens, etc.
- **Environment-Aware Configuration**: Different log formats and levels based on environment
- **Performance Optimized**: Minimal impact on application performance

## Log Levels

The logging system supports the following levels (from highest to lowest priority):

- `fatal`: System is unusable
- `error`: Error events that might still allow the application to continue running
- `warn`: Warning events that might indicate potential issues
- `info`: Informational messages highlighting normal application flow
- `debug`: Detailed debugging information
- `trace`: Very detailed tracing information
- `silent`: No logs are emitted

## Configuration

The log level can be configured via the `LOG_LEVEL` environment variable. If not specified, it defaults to:
- `info` in production
- `debug` in development

## Usage Examples

### In Services

```typescript
import { createLogger } from '../core/logger.js';

export class MyService {
  private logger = createLogger('MyService');
  
  async doSomething(data) {
    this.logger.debug({ data }, 'Starting operation');
    
    try {
      // Do something
      this.logger.info('Operation completed successfully');
    } catch (error) {
      this.logger.error({ error }, 'Operation failed');
      throw error;
    }
  }
}
```

### In Route Handlers

```typescript
app.get('/resource', async (c) => {
  const logger = c.get('logger');
  logger.debug('Processing request for /resource');
  
  // Process request
  
  logger.info('Request completed successfully');
  return c.json({ success: true });
});
```

### In Error Handlers

Error logging is automatically handled by the error middleware. The error handler will log the error with appropriate context including request path, method, and error details.

## Best Practices

1. **Use Appropriate Log Levels**:
   - `error`: For errors that affect functionality
   - `warn`: For potential issues or deprecated features
   - `info`: For significant events in normal operation
   - `debug`: For detailed troubleshooting information

2. **Include Context**:
   - Always pass an object with relevant context as the first parameter
   - Add a descriptive message as the second parameter

3. **Sensitive Data**:
   - Never log sensitive data like passwords or tokens
   - The logger automatically redacts common sensitive fields, but be cautious with custom data

4. **Performance**:
   - Avoid expensive operations in log statements
   - Use conditional logging for very verbose debug information

## Log Output Examples

### Development (Pretty Format)

```
[2023-06-01 12:34:56.789] INFO (app): Server is running on http://localhost:3000
[2023-06-01 12:34:57.123] DEBUG (BookmarkService): Getting bookmarks with query parameters
    queryParams: {
      "limit": 10,
      "cursor": null
    }
```

### Production (JSON Format)

```json
{"level":30,"time":"2023-06-01T12:34:56.789Z","pid":1234,"hostname":"server","context":"app","msg":"Server is running on http://localhost:3000"}
{"level":50,"time":"2023-06-01T12:35:01.234Z","pid":1234,"hostname":"server","context":"BookmarkService","err":{"type":"Error","message":"Database connection failed","stack":"Error: Database connection failed\n    at ..."}, "msg":"Failed to connect to database"}
```