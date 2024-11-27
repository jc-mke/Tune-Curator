import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID as string;
const scope = ['user-read-private', 'user-read-email', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private'];

const SpotifyAuthButton: React.FC = () => {

  const navigate = useNavigate();

  async function authorize() {
    window.location.assign(`https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&scope=${scope}&response_type=token&show_dialog=true`);
  }

   async function getAccessTokenFromURL(urlAfterHash: string) {
      console.log(urlAfterHash);
      const params = new URLSearchParams(urlAfterHash.slice(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        console.log('typeof accessToken: ' + typeof(accessToken));
        localStorage.setItem('spotify_access_token', accessToken);

        navigate('/form');
      } else {
        console.log('access token could not be retrieved from URL; access token variable value: ' + accessToken);
      }
   }

   useEffect(() => {
    if (window.location.hash) {
      getAccessTokenFromURL(window.location.hash);
    }
   });

  return (
    <div>
        <>
          <p className='font-semibold font-serif mb-6 text-center'>Please authorize access to your top items on Spotify</p>
          <button onClick={authorize} className='transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-6'> Authorize
          </button>
        </>
    </div>
  );
};

export default SpotifyAuthButton;
