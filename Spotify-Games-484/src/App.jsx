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
    <div className="App">
      <header className="App-header">
        <h1>Spotify Game App</h1>
        {token && <button onClick={logout}>Logout</button>}
      </header>
      
      {!token ? <Login /> : <Dashboard token={token} />}
    </div>
  );
};

export default App;