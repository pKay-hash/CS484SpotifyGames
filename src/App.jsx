// Our "Main" component in charge of handling the Authentication from Spotify and
// rendering the Login or Dashboard component based on the authentication state.
// We will also store the token in the local storage and provide the header of the whole website, complete with the title and logout button.
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { sanitizeInput } from './utils/xssProtection';

const App = () => {
  const [token, setToken] = useState(null); //used to set and retrieve token from localStorage, passed into the dashboard component as a prop
  const [resetDashboard, setResetDashboard] = useState(false); //used for sending user back to DashboardDefault on click of top-left title text


  // useEffect hook to handle the authentication from Spotify. It will check if the token is stored in the local storage and set it in the state if it is.
  // if not, it will check if the hash contains the access_token and set it in the local storage and state if it does.
  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
      const parsedHash = new URLSearchParams(hash.substring(1));
      const accessToken = sanitizeInput(parsedHash.get("access_token"));
      if (accessToken) {
        window.localStorage.setItem("token", accessToken);
        setToken(accessToken);
        window.history.replaceState(null, null, ' ');
      }
    } else if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // logout function to remove the token from localStorage and set the state to null.
  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("token");
  };

  const handleTitleClick = () => {
    setResetDashboard(true);
  };

  //if the token is null, meaning the user hasn't logged in yet, shows the login component.
  //if the user has logged in, show Dashboard component while passing in the token, which is used for all API calls to Spotify API.
  return (
    <div className="min-h-screen bg-gray-900">
      {!token ? (
        <Login />
      ) : (
        <>
          <header className="bg-gray-800 p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 onClick={handleTitleClick} className="font-teko font-semibold text-4xl bg-gradient-to-r from-green-400 from-20% via-green-200 via-30% to-emerald-500 to-90% inline-block text-transparent bg-clip-text cursor-pointer hover:opacity-80 transition-opacity duration-300">
                  Games On The Spot
              </h1>
              {/* <button 
                className="px-4 py-2 bg-gray-700 text-white rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
                onClick={logout}>
                Logout
              </button> */}
              <button 
                className="
                  px-5 
                  py-2.5 
                  bg-gray-800 
                  text-white 
                  rounded-lg 
                  font-semibold 
                  border 
                  border-gray-700 
                  hover:bg-red-600 
                  hover:text-white 
                  hover:border-red-700 
                  transition-all 
                  duration-300 
                  transform 
                  hover:-translate-y-1 
                  hover:shadow-lg 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-red-500 
                  focus:ring-opacity-50
                "
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </header>
          <Dashboard token={token} onLogout={logout} resetDashboard={resetDashboard} setResetDashboard={setResetDashboard} />
        </>
      )}
    </div>
  );
};

export default App;