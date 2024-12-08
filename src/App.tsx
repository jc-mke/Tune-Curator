// src/App.tsx
import React from 'react';
import SpotifyAuthButton from './components/SpotifyAuthButton';
import PlaylistForm from './components/PlaylistForm';
import PlaylistView from './components/PlaylistView';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-black text-white p-4 min-h-screen">
        <Routes>
        <Route path='/' element={<SpotifyAuthButton />} />
        <Route path='/form' element={<PlaylistForm />} />
        <Route path="/playlist/:playlistId" element={<PlaylistView />} />
        </Routes>
      </div>
    </Router>
  );
};


export default App;
