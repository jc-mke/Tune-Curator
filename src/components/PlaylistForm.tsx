// src/components/PlaylistForm.tsx
import React, { useState } from 'react';
import createPlaylist from '../service/SpotifyService';

const PlaylistForm: React.FC = () => {
  const [formData, setFormData] = useState<PlaylistFormData>(
    { 
      playlistName: 'Tune Curator Generated Playlist',
      playlistSeed: '',
      isPublic: false,
      playlistDescription: ''
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name] : value
    })
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
        <label htmlFor="playlistName" className="mr-1 font-bold">Name: </label>
        <input className="mb-3 text-black" type="text" id="playlistName" name="playlistName" defaultValue={"Tune Curator Generated Playlist"} size={30} required={true} minLength={1} maxLength={50} onChange={handleChange}></input>
        <label htmlFor="isPublic" className="ml-10 font-bold">Public: </label>
        <input className="mr-10 mb-3" type="checkbox" defaultChecked={false} name="isPublic" id="isPublic" onChange={handleChange}></input>
        <label htmlFor="playlistDescription" className="mr-1 font-bold">Description: </label>
        <input className="mb-5 text-black" type="text" id="playlistDescription" name="playlistDescription" size={30} onChange={handleChange}></input>
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

      <button className="transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-3" type="submit">
        Submit
      </button>
    </form>
  );
};

export default PlaylistForm;
