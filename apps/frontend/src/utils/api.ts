import ky from 'ky';

// Configure API base URL based on environment
const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }

  // In production, use the current origin
  return window.location.origin;
};

// Create a Ky instance with default configuration
export const api = ky.create({
  prefixUrl: getApiBaseUrl(),
  credentials: 'include', // Always include cookies for session handling
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
});

export type ApiResponse<T> = T;

export type ApiError = {
  error: {
    code: string;
    message: string;
    name: string;
  };
  timestamp: string;
};
