//Page that is rendered to prompt user to log into Spotify, and handles all configuration in terms of access types in the AUTH_URL.

import {React, useState} from 'react';
import logo from '../assets/logo.png'; // Import the logo (nice)
import styles from './Login.module.css';
import Header from './Header';
import { sanitizeInput } from '../utils/xssProtection';
import drake from '../assets/drake.png';
import cole from '../assets/coleworld.png';
import kdot from '../assets/Kendrick-Lamar.png';


const clientId = import.meta.env.VITE_CLIENT_ID || '8d028dc7fb1741a5affeae86686969fe';
const redirectUri = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/';
//the line below, provided by Spotify, specifies the clientID (that I made for the app), and specifies my redirect_URI.
//redirect_URI and client_id are both environment variables in CloudFlare, so I say to use that if it is available, otherwise,
//to use my localhost as the redirect, as we must be developing locally.

// prev styles clipboard
//${styles['bg-gradient-animation']} -> gradient class 
//bg-gradient-to-r from-green-400 from-20% via-green-200 via-30% to-emerald-500 to-90% inline-block text-transparent bg-clip-text -> OG gradient (by yours truly)
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(sanitizeInput(clientId))}&response_type=token&redirect_uri=${encodeURIComponent(sanitizeInput(redirectUri))}&scope=user-read-private%20user-read-email%20user-top-read%20user-library-read%20playlist-read-private%20user-read-recently-played`;

const Login = () => {
  const [getStartedClicked, setGetStartedClicked] = useState(false);
  return (
    <div className={`min-h-screen flex flex-col content-center bg-gradient-to-r from-stone-900 to-zinc-800`}>
      {/* <img src={logo} alt="Games On The Spot Logo" className="w-8 h-8 ml-20 justify-self-start" /> */}
      <Header />
      <div className="content flex flex-row">
        <div className="title flex flex-col bg-zinc-800 border-zinc-800 border-r-2 border-b-2 rounded-br-3xl justify-start mr-[25em] px-10 py-10 ">
          <h1 className="font-teko font-semibold text-8xl mt-7 mb-4 text-start text-green-500">Welcome to </h1>
          <h1 className="font-teko font-semibold text-8xl mb-6 text-start bg-gradient-to-r from-zinc-400 to-zinc-50 bg-clip-text text-transparent inline-block text-transparent bg-clip-text">Games On The Spot!</h1>
          <p className="font-oswald text-lg mb-8 text-start text-gray-300">Discover your music taste through fun, interactive games that are curated from your Spotify Premium Account without their permission!</p>
          <div className="flex flex-row justify-center content-center space-x-8">

          <div className="w-96 bg-zinc-700 bg-opacity-80 rounded-lg shadow-xl overflow-hidden mr-10">
            <div className="p-8">
              
              <div className="space-y-4">
                {/* <p className="text-sm text-gray-400 text-center">Connect with your Spotify account to start playing</p> */}
                <a 
                  href={AUTH_URL}
                  className="block w-full flex flex-row content-center justify-center py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-center focus:outline-none animate-pulsate focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                  </svg>
                  Login with Spotify
                </a>
              </div>
            </div>
            <div className="px-8 py-4 bg-zinc-900 bg-opacity-80 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                By logging in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
          
        </div>
        </div>
        <div className="pictures ml-[-20em]">
          <img src={cole} className='w-72 h-72 absolute top-10 left-190 transform origin-top-left translate-x-60 translate-y-0  opacity-80 animate-animateCole'></img>
          <img src={kdot} className='w-84 h-72 absolute top-32 left-160 transform origin-top-left translate-x-20 translate-y-10  opacity-80 animate-animateKdot'></img>
          <img src={drake} className='w-84 h-84 absolute top-60 left-120 transform origin-top-left translate-x-[-10] translate-y-40  opacity-80 animate-animateDrake'></img>
        </div>
      </div>
      
      
      
      
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          This app uses Spotify data to create a personalized experience. Your data is only used within the app and is not stored or shared.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Spotify Game App is not associated with Spotify AB or any of its partners in any way.
        </p>
      </div>
    </div>
    
  );
};

export default Login;