// src/components/PlaylistForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import createPlaylist from '../service/SpotifyService';
import NoTopItemsError from '../classes/errors/NoTopItemsError';
import ValidationError from '../classes/errors/ValidationError';
import AccessTokenExpiredError from '../classes/errors/AccessTokenExpiredError';
import NoNewReleasesError from '../classes/errors/NoNewReleasesError';
import ErrorMessages from './ErrorMessages';

const PlaylistForm: React.FC = () => {
  const [formData, setFormData] = useState<PlaylistFormData>(
    { 
      playlistName: 'Tune Curator Generated Playlist',
      playlistSeed: '',
      isPublic: false,
      playlistDescription: ''
    }
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name] : value
    })
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(
        `Submitting the following form to the Spotify Service to create a playlist: ${JSON.stringify(
          formData
        )}`
      );
      const newPlaylistId = await createPlaylist(formData);
      if (newPlaylistId) {
        // Navigate to the PlaylistView route
        navigate(`/playlist/${newPlaylistId}`);
      }
    } catch (error) {
      if (error instanceof NoTopItemsError || 
          error instanceof ValidationError || 
          error instanceof NoNewReleasesError) {
        setErrorMessage(error.message);
      } else if (error instanceof AccessTokenExpiredError) {
        setErrorMessage(error.message);
        setIsTokenExpired(true);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <>
    <form className="bg-black flex flex-col items-center" onSubmit={handleSubmit}>
      <header className="text-2xl font-semibold font-serif mb-6 text-center">
        Generate A New Playlist 
      </header>
      <div className="border-2 border-white p-5 rounded-none shadow-lg mb-5">

        <div className="flex flex-col mb-4">
        <label htmlFor="playlistName" className="mb-1 font-bold">Name: </label>
        <input className="text-black" type="text" id="playlistName" name="playlistName" defaultValue={"Tune Curator Generated Playlist"} size={30} required={true} minLength={1} maxLength={50} onChange={handleChange}></input>
        </div>

        <div className="flex items-center mb-4">
        <label htmlFor="isPublic" className="font-bold">Public: </label>
        <input className="ml-2" type="checkbox" defaultChecked={false} name="isPublic" id="isPublic" onChange={handleChange}></input>
        </div>

        <div className="flex flex-col mb-4">
        <label htmlFor="playlistDescription" className="mr-1 font-bold">Description: </label>
        <input className="text-black" type="text" id="playlistDescription" name="playlistDescription" size={30} onChange={handleChange}></input>
        </div>

        <fieldset>
          <legend className="font-bold mt-10 mb-3 text-center">Playlist based on:</legend>
          <div className="flex flex-col items-center space-y-2">
            <div>
              <input
                type="radio"
                name="playlistSeed"
                id="top-artists-seed"
                value="top-artists"
                className="mr-2"
                onChange={handleChange}
              />
              <label htmlFor="top-artists-seed">Your Top Artists</label>
            </div>
            <div>
              <input
                type="radio"
                name="playlistSeed"
                id="top-tracks-seed"
                value="top-tracks"
                className="mr-2"
                onChange={handleChange}
              />
              <label htmlFor="top-tracks-seed">Your Top Tracks</label>
            </div>
            <div>
              <input
                type="radio"
                name="playlistSeed"
                id="new-releases-seed"
                value="new-releases"
                className="mr-2"
                onChange={handleChange}
              />
              <label htmlFor="new-releases-seed">New Releases</label>
            </div>
          </div>
        </fieldset>
      </div>

      <button className="transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold" type="submit">
        Submit
      </button>
    </form>

    {errorMessage !== '' ? <ErrorMessages message={errorMessage} isTokenExpired={isTokenExpired}></ErrorMessages> : null}
  </>
  );
};

export default PlaylistForm;
