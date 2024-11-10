// src/App.tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import RecommendationsForm from './components/RecommendationsForm';
import Auth from './components/Auth';

const App: React.FC = () => {
  return (
    <AuthProvider> {/* Wrap all other components in AuthProvider */}
      <div className="bg-black text-white p-4 min-h-screen">
        <Auth />
        <section>
          <RecommendationsForm />
        </section>
      </div>
    </AuthProvider>
  );
};


export default App;
