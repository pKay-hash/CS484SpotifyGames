import React from 'react';


const AUTH_URL = "https://accounts.spotify.com/authorize?client_id=8d028dc7fb1741a5affeae86686969fe&response_type=token&redirect_uri=http://localhost:5173/&scope=user-read-private%20user-read-email%20user-top-read%20user-library-read%20playlist-read-private";

const Login = () => {
  return (
    <div>
      <h2>Welcome to the Spotify Game App</h2>
      <p>Please log in with your Spotify account to continue.</p>
      <a href={AUTH_URL}>Login with Spotify</a>
    </div>
  );
};

export default Login;