import pino from 'pino';
import { env, NodeEnvs } from '../env.js';

const LogLevels = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
  SILENT: 'silent',
} as const;

// Define sensitive fields that should be redacted in logs
const REDACT_FIELDS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'key',
  'apiKey',
  'api_key',
  'access_token',
  'refresh_token',
  'credit_card',
  'creditCard',
  'req.headers.authorization',
  'req.headers.cookie',
];

// Configure logger based on environment
const getLoggerConfig = () => {
  const isProduction = env.NODE_ENV === NodeEnvs.PRODUCTION;
  const isDevelopment = env.NODE_ENV === NodeEnvs.DEVELOPMENT;

  return {
    level:
      process.env.LOG_LEVEL ||
      (isProduction ? LogLevels.INFO : LogLevels.DEBUG),
    redact: {
      paths: REDACT_FIELDS,
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  };
};

// Create the base logger instance
const baseLogger = pino(getLoggerConfig());

// Create a logger with context
export const createLogger = (context: string) => {
  return baseLogger.child({ context });
};

// Centralized logger instance for application-wide use
export const logger = createLogger('app');
