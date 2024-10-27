// src/components/Auth.tsx
import React, { useEffect, useState } from 'react';
import { getAccessToken, redirectToAuthCodeFlow } from '../service/AuthService';

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID as string;

const Auth: React.FC = () => {
  // Since the component renders multiple times, I need to track if the getAccessToken function has been called already
  const [hasCalled, setHasCalled] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code && !hasCalled) {
      console.log('AUTH CODE EXISTS, SO REQUESTING ACCESS TOKEN');
      getAccessToken(clientId, code).then(() => {
        // Clean up the URL by removing the code parameter
        params.delete('code');
        window.history.replaceState({}, document.title, window.location.pathname + '?' + params.toString());
      });
      setHasCalled(true);
    } else if (!code && !hasCalled) {
      console.log('NO AUTH CODE, SO GENERATING ONE');
      redirectToAuthCodeFlow(clientId);
    }
  }, [hasCalled]);

  return null; // This component doesn't render anything visible
};

export default Auth;
