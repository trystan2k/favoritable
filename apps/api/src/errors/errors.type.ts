export type ErrorResponse = {
  success: boolean
  error: {
    code?: string
    message: string
    name?: string
    stack?: unknown
    cause?: unknown
  }
  timestamp: string
};

