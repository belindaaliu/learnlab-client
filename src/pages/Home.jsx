// src/pages/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-primary mb-6">Welcome to LearnLab 🚀</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        The ultimate platform to master new skills and advance your career.
      </p>
      <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg">
        Start Learning Now
      </button>
    </div>
  );
};

export default Home;