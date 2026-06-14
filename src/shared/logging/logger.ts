type LogContext = Record<string, unknown>;

function writeConsoleLog(method: 'warn' | 'error', message: string, context?: LogContext) {
  if (context) {
    console[method](message, context);
    return;
  }

  console[method](message);
}

export const appLogger = {
  error(message: string, context?: LogContext) {
    writeConsoleLog('error', message, context);
  },
  warn(message: string, context?: LogContext) {
    writeConsoleLog('warn', message, context);
  }
};
