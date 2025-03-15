export type ErrorResponse = {
  error: {
    code?: string
    message: string
    name?: string
    stack?: unknown
    cause?: unknown
  }
  timestamp: string
};

