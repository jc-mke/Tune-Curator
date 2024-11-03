// src/context/AuthContext.tsx
import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { getAccessToken, redirectToAuthCodeFlow } from '../service/AuthService';

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID as string;

type AuthState = {
  token: string | null;
  isAuthenticating: boolean;
  error: string | null;
};

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; token: string }
  | { type: 'AUTH_FAILURE'; error: string };

const initialState: AuthState = {
  token: localStorage.getItem('spotify_access_token'),
  isAuthenticating: false,
  error: null,
};

// Define the reducer to manage authentication state
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
      case 'AUTH_START':
        return { ...state, isAuthenticating: true, error: null };
      case 'AUTH_SUCCESS':
        return { ...state, token: action.token, isAuthenticating: false };
      case 'AUTH_FAILURE':
        return { ...state, error: action.error, isAuthenticating: false };
      default:
        return state;
    }
  };

const AuthContext = createContext<{ state: AuthState; dispatch: React.Dispatch<AuthAction> }>({
  state: initialState,
  dispatch: () => null,
});

// Update the AuthProvider to accept children
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code && !state.isAuthenticating) {
      dispatch({ type: 'AUTH_START' });

      getAccessToken(clientId, code)
        .then((response) => {
          localStorage.setItem('spotify_access_token', response.access_token);
          dispatch({ type: 'AUTH_SUCCESS', token: response.access_token });
          params.delete('code');
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
            console.log(`Error when retrieving access token: ${JSON.stringify(error)}`);
          dispatch({ type: 'AUTH_FAILURE', error: 'Failed to retrieve access token' });
        });
    } else if (!code && !state.token) {
      redirectToAuthCodeFlow(clientId);
    }
  }, [state.token, state.isAuthenticating]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
