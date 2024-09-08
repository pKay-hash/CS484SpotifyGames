import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
      const parsedHash = new URLSearchParams(hash.substring(1));
      const accessToken = parsedHash.get("access_token");
      if (accessToken) {
        window.localStorage.setItem("token", accessToken);
        setToken(accessToken);
        window.history.replaceState(null, null, ' ');
      }
    } else if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("token");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {!token ? (
        <Login />
      ) : (
        <>
          <header className="bg-gray-800 p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-500">Spotify Game App</h1>
              <button 
                className="px-4 py-2 bg-gray-700 text-white rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
                onClick={logout}>
                Logout
              </button>
            </div>
          </header>
          <Dashboard token={token} />
        </>
      )}
    </div>
  );
};

export default App;