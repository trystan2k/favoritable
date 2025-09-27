import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { api } from '../utils/api';

// Types for user data and auth state
export type User = {
  id: string;
  email: string;
  name: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Auth context
export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Function to check current session
  const checkSession = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Call the backend session endpoint to check if user is authenticated
      const response = await api.get('api/auth/session');
      const sessionData = await response.json<{ user: User }>();

      if (sessionData.user) {
        dispatch({ type: 'SET_USER', payload: sessionData.user });
      } else {
        dispatch({ type: 'CLEAR_USER' });
      }
    } catch (_error) {
      // If session check fails (e.g., 401), user is not authenticated
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  // Function to logout user
  const logout = async () => {
    try {
      // Call backend logout endpoint to destroy session
      await api.post('api/auth/logout');
    } catch (_error) {
      // Continue with client-side logout even if backend fails
    } finally {
      // Always clear user state locally
      dispatch({ type: 'CLEAR_USER' });
    }
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
