const accessTokenURI = 'https://accounts.spotify.com/api/token';

export async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('code_verifier', verifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope: 'user-read-private user-read-email user-top-read',
        code_challenge_method: 'S256',
        code_challenge: challenge,
        redirect_uri: 'http://localhost:3000'
    }
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

export async function getAccessToken(clientId: string, authorizationCode: string): Promise<AccessTokenResponse> {
    const verifier = localStorage.getItem('code_verifier');
    console.log('AUTHORIZATION CODE: ' + authorizationCode);

    const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code: authorizationCode,
          redirect_uri: 'http://localhost:3000',
          code_verifier: verifier!,
        }),
      }

    const body = await fetch(accessTokenURI, payload);
    const response = await body.json();

    
    console.log(`ACCESS TOKEN RESPONSE: ${JSON.stringify(response)}`);

    return response; 
}

export async function getRefreshedToken(): Promise<void> {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID as string;
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) {
    throw new Error('Refresh token is not present');
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken!,
      client_id: clientId!
    }),
  }

  const body = await fetch(accessTokenURI, payload);
  const response = await body.json() as AccessTokenResponse;
  localStorage.setItem('spotify_access_token', response.access_token);
  if (response.refresh_token) {
    localStorage.setItem('spotify_refresh_token', response.access_token);
  }
}

export function generateCodeVerifier(length: number) {
    console.log('generating code verifier');
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export async function generateCodeChallenge(codeVerifier: string) {
    console.log('generating code challenge');
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}