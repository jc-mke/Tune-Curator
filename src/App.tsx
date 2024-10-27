// src/App.tsx
import React from 'react';
import RecommendationsForm from './components/RecommendationsForm';
import Auth from './components/Auth';

const App: React.FC = () => {
  return (
    <div className="bg-black text-white p-4 min-h-screen">
      <Auth />
      <nav className="mb-4">
        <ul className="flex items-center">
          <li className="flex items-center">
            <span id="avatar" className="mr-2"></span>
            <span id="displayName" className="font-serif"></span>
          </li>
        </ul>
      </nav>
      <section>
        <RecommendationsForm />
      </section>
    </div>
  );
};

export default App;
