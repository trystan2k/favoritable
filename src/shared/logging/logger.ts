import pino from 'pino';

type LogContext = Record<string, unknown>;
type LogLevel = 'warn' | 'error';

const pinoLogger = pino({
  base: undefined,
  browser: {
    asObject: true
  },
  level: import.meta.env.MODE === 'test' ? 'silent' : 'info',
  name: 'favoritable'
});

function writePinoLog(level: LogLevel, message: string, context?: LogContext) {
  if (context) {
    pinoLogger[level](context, message);
    return;
  }

  pinoLogger[level](message);
}

export const appLogger = {
  error(message: string, context?: LogContext) {
    writePinoLog('error', message, context);
  },
  warn(message: string, context?: LogContext) {
    writePinoLog('warn', message, context);
  }
};
