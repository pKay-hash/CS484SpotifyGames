import React from 'react';

const clientId = import.meta.env.VITE_CLIENT_ID || '8d028dc7fb1741a5affeae86686969fe';
const redirectUri = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/';
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(clientId)}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-private%20user-read-email%20user-top-read%20user-library-read%20playlist-read-private%20user-read-recently-played`;
const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-4">Welcome to the Spotify Game App</h2>
      <p className="text-lg mb-6">Please log in with your Spotify account to continue.</p>
      <a className="font-medium text-indigo-500 hover:text-indigo-400 underline transition-colors duration-200" href={AUTH_URL}>Login with Spotify</a>
    </div>
  );
};

export default Login;