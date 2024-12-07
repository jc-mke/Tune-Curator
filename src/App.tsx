// src/App.tsx
import React from 'react';
import SpotifyAuthButton from './components/SpotifyAuthButton';
import PlaylistForm from './components/PlaylistForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-black text-white p-4 min-h-screen">
        <Routes>
        <Route path='/' element={<SpotifyAuthButton />} />
        <Route path='/form' element={<PlaylistForm />} />
        </Routes>
      </div>
    </Router>
  );
};


export default App;
