import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    console.log("useEffect is running");
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");
    console.log("Initial hash:", hash);
    console.log("Stored token:", storedToken);

    // Check if the hash contains an access token and set it if it does not exist in local storage yet
    if (!storedToken && hash) {
      const parsedHash = new URLSearchParams(hash.substring(1));
      console.log("parsedHashRRRR:", parsedHash);
      const accessToken = parsedHash.get("access_token");
      console.log("Parsed access token:", accessToken);
      if (accessToken) {
        window.localStorage.setItem("token", accessToken);
        setToken(accessToken);
        setTimeout(() => {
          window.location.hash = "";  // Clear the hash after ensuring everything is set
        }, 10000);
      }
    } else if (storedToken) {
      console.log("Stored tokenRRRR:", storedToken);
      setToken(storedToken);
    }
  }, []);
  console.log("Current token state:", token);

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("token");
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Spotify Game App</h1>
          {token && <button onClick={logout}>Logout</button>}

        </header>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;