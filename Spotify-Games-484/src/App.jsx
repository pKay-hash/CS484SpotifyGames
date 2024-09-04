import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const hash = window.location.hash; //sets hash to the current window location hash
    let storedToken = window.localStorage.getItem("token"); //if token already exists, then just use that one

    if (!storedToken && hash) { //if token doesn't exist yet
      const parsedHash = new URLSearchParams(hash.substring(1)); //parse URL for token
      const accessToken = parsedHash.get("access_token");
      if (accessToken) {
        window.localStorage.setItem("token", accessToken);//store token in localStorage
        setToken(accessToken);
        window.history.replaceState(null, null, ' '); //set url back to /
      }
    } else if (storedToken) {//if token exists already.
      setToken(storedToken);
    }
  }, []);

  //removes token from local storage and sets token to null when logout is clicked
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