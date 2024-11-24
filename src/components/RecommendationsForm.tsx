// src/components/RecommendationsForm.tsx
import React, { useState } from 'react';
import Form from '../classes/Form';
import fetchArtistRecommendations from '../service/SpotifyService';

const RecommendationsForm: React.FC = () => {
  const [formData, setFormData] = useState<Form>(
    new Form('', 0.5, 0.5, 0.5, 0.5)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'range' ? parseFloat(value) : value;

    setFormData((prevForm) => {
      return new Form(
        name === 'recommendationsSeed' ? (parsedValue as string) : prevForm.recommendationsSeed,
        name === 'popularity' ? (parsedValue as number) : prevForm.popularity,
        name === 'danceability' ? (parsedValue as number) : prevForm.danceability,
        name === 'energy' ? (parsedValue as number) : prevForm.energy,
        name === 'instrumentalness' ? (parsedValue as number) : prevForm.instrumentalness
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    fetchArtistRecommendations(formData);
  };

  return (
    <form className="bg-black flex flex-col items-center" onSubmit={handleSubmit}>
      <header className="text-xl font-semibold font-serif mb-6 text-center">
        Retrieve New Recommendations
      </header>
      <div className="border-2 border-white p-5 rounded-none shadow-lg mb-5">
        <fieldset>
          <legend className="font-bold mb-3">Recommendations based on:</legend>
          <div className="flex flex-col space-y-2">
            <div>
              <input
                type="radio"
                name="recommendationsSeed"
                id="top-artists-seed"
                value="top-artists"
                className="mr-2"
                onChange={handleChange}
              />
              <label htmlFor="top-artists-seed">Top Artists</label>
            </div>
            <div>
              <input
                type="radio"
                name="recommendationsSeed"
                id="top-tracks-seed"
                value="top-tracks"
                className="mr-2"
                onChange={handleChange}
              />
              <label htmlFor="top-tracks-seed">Top Tracks</label>
            </div>
            <div>
              <input
                type="radio"
                name="recommendationsSeed"
                id="recent-genres-seed"
                value="recent-genres"
                className="mr-2"
                onChange={handleChange}
              />
              <label htmlFor="recent-genres-seed">Recent Genres</label>
            </div>
          </div>
        </fieldset>
      </div>

{/** Range Inputs */}
{['popularity', 'danceability', 'energy', 'instrumentalness'].map((field) => {
  let leftLabel = '';
  let rightLabel = '';

  switch (field) {
    case 'popularity':
      leftLabel = 'Underground';
      rightLabel = 'Mainstream';
      break;
    case 'danceability':
      leftLabel = 'Not Danceable';
      rightLabel = 'Danceable';
      break;
    case 'energy':
      leftLabel = 'Chill';
      rightLabel = 'Energetic';
      break;
    case 'instrumentalness':
      leftLabel = 'Instrumental';
      rightLabel = 'Vocal-Based';
      break;
  }

  return (
    <div className="relative text-center mt-8" key={field}>
      <label htmlFor={field} className="absolute -left-6 -top-6 font-bold">
        {leftLabel}
      </label>
      <input
        type="range"
        id={field}
        name={field}
        min="0"
        max="1"
        step="0.1"
        className="w-72 h-2 bg-gray-300 rounded-lg appearance-none mx-5"
        onChange={handleChange}
      />
      <label htmlFor={field} className="absolute -right-6 -top-6 font-bold">
        {rightLabel}
      </label>
    </div>
  );
})}

      <button className="transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-6" type="submit">
        Submit
      </button>
    </form>
  );
};

export default RecommendationsForm;
