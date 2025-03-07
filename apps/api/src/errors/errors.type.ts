export type ErrorResponse = {
  success: boolean
  error: {
    code?: string
    message: string
    name?: string
    details?: unknown
  }
  timestamp: string
};

