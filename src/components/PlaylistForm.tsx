// src/components/PlaylistForm.tsx
import React, { useState } from 'react';
import createPlaylist from '../service/SpotifyService';

const PlaylistForm: React.FC = () => {
  const [formData, setFormData] = useState<PlaylistFormData>(
    {playlistSeed: ''}
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({playlistSeed: e.target.value});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    createPlaylist(formData);
  };

  return (
    <form className="bg-black flex flex-col items-center" onSubmit={handleSubmit}>
      <header className="text-xl font-semibold font-serif mb-6 text-center">
        Generate A New Playlist 
      </header>
      <div className="border-2 border-white p-5 rounded-none shadow-lg mb-5">
        <fieldset>
          <legend className="font-bold mb-3">Playlist based on:</legend>
          <div className="flex flex-col space-y-2">
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
          </div>
        </fieldset>
      </div>

      <button className="transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-6" type="submit">
        Submit
      </button>
    </form>
  );
};

export default PlaylistForm;
