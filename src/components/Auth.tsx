// src/components/Auth.tsx
import React, { useEffect } from 'react';
import { getAccessToken, redirectToAuthCodeFlow } from '../service/AuthService';

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID as string;

const Auth: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const token = localStorage.getItem('spotify_access_token');

    // If token exists, skip the authentication process
    if (token) {
      console.log('Access token already retrieved.');
      return;
    }

    // If no token but an auth code is present, request access token
    if (code) {
      // Check if code has already been used to avoid multiple requests
      const codeUsed = localStorage.getItem('spotify_code_used');
      if (codeUsed === code) {
        console.log('Authorization code already used.');
        return;
      }

      console.log('AUTH CODE EXISTS, REQUESTING ACCESS TOKEN');
      
      getAccessToken(clientId, code)
        .then((accessToken) => {
          // Store token and mark the code as used
          localStorage.setItem('spotify_access_token', accessToken);
          localStorage.setItem('spotify_code_used', code);

          // Clean up the URL by removing the code parameter
          params.delete('code');
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          console.error('Failed to retrieve access token:', error);
        });
    } else {
      console.log('NO AUTH CODE, REDIRECTING TO AUTH');
      redirectToAuthCodeFlow(clientId);
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default Auth;
