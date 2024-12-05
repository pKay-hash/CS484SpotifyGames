// Used as the default page before any game is selected, showing general data about the user's listening habits.

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PlayIcon, PauseIcon} from '@heroicons/react/solid';
import { sanitizeInput } from '../utils/xssProtection';
// import { 
//   MusicalNoteIcon, 
//   RocketLaunchIcon, 
//   PuzzlePieceIcon, 
//   SparklesIcon 
// } from '@heroicons/react/outline';
const GameCard = ({ icon, title, description, onClick, isSelected }) => (
  <div 
    onClick={onClick}
    className={` group cursor-pointer relative overflow-hidden rounded-xl p-6 transition-all duration-300 ease-in-out 
      ${isSelected 
        ? 'bg-blue-600 text-white scale-105 shadow-2xl' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
    `}
  >
    {/* <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="h-24 w-24" />
    </div> */}
    {icon}    

    <div className="relative z-10">
      {/* <Icon className={`h-12 w-12 mb-4 ${isSelected ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'}`} /> */}
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-sm opacity-75">{description}</p>
    </div>
  </div>

);
const DashboardDefault = ({ token, timeRange, onGameSelect }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [favoriteMusic, setFavoriteMusic] = useState({ year: null, decade: null }); //shows the user's favorite decade of music
  const [mostListenedAlbum, setMostListenedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const audioRef = useRef(new Audio());


  const games = [
    {
      id: 'guessTheSong',
      title: 'Guess the Song',
      description: <p>Challenge yourself to identify tracks <div className='text-red-500'>[DEPRECATED]</div></p>,
      icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" clipRule="evenodd" />
          </svg>
    },
    {
      id: 'higherOrLower',
      title: 'Higher or Lower',
      description: 'Compare track popularity',
      icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
    },
    {
      id: 'guessTheAlbum',
      title: 'Guess the Album',
      description: <p>Test your album recognition skills <div className="text-red-500">[DEPRECATED]</div></p>,
      icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
          </svg>
 
    },
    {
      id: 'tierListCreator',
      title: 'Tier List Creator',
      description: 'Rank your favorite tracks and artists',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
            </svg>

    },
    {
      id: 'bracketCreator',
      title: 'Bracket Creator',
      description: 'Create ultimate music tournaments',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 0 1 .878.645 49.17 49.17 0 0 1 .376 5.452.657.657 0 0 1-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 0 0-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 0 1-.595 4.845.75.75 0 0 1-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 0 1-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 0 1-.658.643 49.118 49.118 0 0 1-4.708-.36.75.75 0 0 1-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 0 0 5.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 0 0 .659-.663 47.703 47.703 0 0 0-.31-4.82.75.75 0 0 1 .83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 0 0 .657-.642Z" />
            </svg>

    }
  ];


  //fetches various kinds of data from Spotify API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      //favorite Tracks and Artists
      try {
        //gets 50, as all 50 will be used for different calculations (such as favoriteMusic state), 
        //but we only need 5 to physically display on the DashboardDefault component.
        const [tracksResponse, artistsResponse] = await Promise.all([
          axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { limit: 50, time_range: timeRange }
          }),
          //we will only need 5 for the 
          axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { limit: 5, time_range: timeRange }
          })
        ]);

        //gets the top 5 tracks and artists
        setTopTracks(tracksResponse.data.items.slice(0, 5));
        setTopArtists(artistsResponse.data.items);

        // returns yearCounts used for the calculation of favorite year and decade
        const yearCounts = tracksResponse.data.items.reduce((acc, track) => {
          const year = new Date(track.album.release_date).getFullYear();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});


        const favoriteYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0][0];
        const favoriteDecade = Math.floor(favoriteYear / 10) * 10;

        setFavoriteMusic({ year: favoriteYear, decade: favoriteDecade });

        // Get recommendations based off of top 2 artists and tracks from Spotify API
        const seedArtists = artistsResponse.data.items.slice(0, 2).map(artist => artist.id).join(',');
        const seedTracks = tracksResponse.data.items.slice(0, 2).map(track => track.id).join(',');
        // const recommendationsResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
        //   headers: { 'Authorization': `Bearer ${token}` },
        //   params: {
        //     seed_artists: seedArtists,
        //     seed_tracks: seedTracks,
        //     limit: 5
        //   }
        // });
        // setRecommendations(recommendationsResponse.data.tracks);

        // Calculate favorite genres
        const genreCounts = artistsResponse.data.items.flatMap(artist => artist.genres)
          .reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
          }, {});
        let favGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
        if(favGenres.length > 9){
          //If there are more than 9 genres, we will only display the top 9.
          favGenres = favGenres.slice(0, 9);
        }
        setFavoriteGenres(favGenres.map(([genre]) => genre));

        // Find albums from most listened songs
        const albumCounts = tracksResponse.data.items.reduce((acc, track) => {
          acc[track.album.id] = (acc[track.album.id] || 0) + 1;
          return acc;
        }, {});
        const mostListenedAlbumId = Object.entries(albumCounts)
          .sort((a, b) => b[1] - a[1])[0][0];
        setMostListenedAlbum(tracksResponse.data.items.find(track => track.album.id === mostListenedAlbumId).album);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, timeRange]);

  // Function to handle preview play/pause
  const handlePlayPause = (track) => {
    if (currentlyPlaying === track.id) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        audioRef.current.pause();
      }
      audioRef.current.src = track.preview_url;
      audioRef.current.play();
      setCurrentlyPlaying(track.id);
    }
  };

  // useEffect hook to handle audio playback
  useEffect(() => {
    audioRef.current.addEventListener('ended', () => setCurrentlyPlaying(null));
    return () => {
      audioRef.current.removeEventListener('ended', () => setCurrentlyPlaying(null));
      audioRef.current.pause();
    };
  }, []);

  //shows loading text
  // if (loading) {
  //   return <div className="text-center mt-20 text-xl">Loading your personalized dashboard...</div>;
  // }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-pulse text-4xl mb-4">Loading...</div>
          <p className="text-gray-400">Preparing your musical journey</p>
        </div>
      </div>
    );
  } 
  //used for giving the genres different background colors to add some visual variety into the website
  const genreColors = [
    'bg-pink-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500'
  ];

  //shows time range for the music era section
  const timeRangeText = {
    short_term: 'This month',
    medium_term: 'In the last 6 months',
    long_term: 'In the last year'
  };

  return (
  

  

  //     <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
  //       <h3 className="text-2xl font-semibold mb-4 text-purple-400">Recommended Tracks</h3>
  //       <ul className="space-y-4">
  //         {recommendations.map((track) => (
  //           <li key={track.id} className="flex items-center space-x-4">
  //             <div className="relative group">
  //               <img src={track.album.images[2].url} alt={track.name} className="w-16 h-16 rounded" />
  //               {track.preview_url && (
  //                 <button
  //                   className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
  //                   onClick={() => handlePlayPause(track)}
  //                 >
  //                   {currentlyPlaying === track.id ? (
  //                     <PauseIcon className="h-8 w-8 text-white" />
  //                   ) : (
  //                     <PlayIcon className="h-8 w-8 text-white" />
  //                   )}
  //                 </button>
  //               )}
  //             </div>
  //             <div>
  //               <span className="font-medium text-lg">{track.name}</span>
  //               <p className="text-gray-400">{track.artists[0].name}</p>
  //             </div>
  //           </li>
  //         ))}
  //       </ul>
  //     </div>

  

  

  

  // START OF NEW CODE

  <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Game Selection Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-6">Choose Your Musical Game</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id}
                {...game}
                onClick={() => onGameSelect(game.id)}
                isSelected={selectedGame === game.id}
              />
            ))}
          </div>
        </div>

        {/* Conditionally render dashboard content if a game is selected */}
        {selectedGame && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* [Previous dashboard sections remain the same] */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-400 ">Your Top Tracks</h3>
              {/* ... existing top tracks content ... */}
            </div>
            {/* ... other sections ... */}
          </div>
        )}
      </div>
      <h2 className="max-w-7xl mx-auto text-4xl font-bold text-white mb-6">Your Listening</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
       <div className="bg-gray-800 p-6 rounded-lg shadow-lg ">
         <h3 className="text-2xl font-semibold mb-4 text-blue-400 border-b border-gray-700 pb-3">Your Top Tracks</h3>
         <ul className="space-y-4">
           {topTracks.map((track) => (
             <li key={track.id} className="flex items-center space-x-4 hover:opacity-60 transition-opacity duration-300">
               <div className="relative group ">
                 <img src={track.album.images[2].url} alt={track.name} className="w-16 h-16 rounded" />
                 {track.preview_url && (
                   <button
                     className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                     onClick={() => handlePlayPause(track)}
                   >
                     {currentlyPlaying === track.id ? (
                       <PauseIcon className="h-8 w-8 text-white" />
                     ) : (
                       <PlayIcon className="h-8 w-8 text-white" />
                     )}
                   </button>
                 )}
               </div>
               <div>
                 <span className="font-medium text-lg">{track.name.slice(0,40)}</span>
                 <p className="text-gray-400">{track.artists[0].name}</p>
               </div>
             </li>
           ))}
         </ul>
       </div>
       <div className="bg-gray-800 p-6 rounded-lg shadow-lg"> {/* TOP ARTISTS*/}
        <h3 className="text-2xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-3">Your Top Artists</h3>
        <ul className="space-y-4">
          {topArtists.map((artist, index) => (
            <li key={artist.id} className="flex items-center space-x-4 hover:opacity-60 transition-opacity duration-300">
              <img src={artist.images[2].url} alt={artist.name} className="w-16 h-16 rounded-full" />
              <span className="font-medium text-lg">{artist.name}</span>
            </li>
          ))}
        </ul>
       </div>
       <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-center items-center">
        <h3 className="text-2xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-3">Your Favorite Genres</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {favoriteGenres.map((genre, index) => (
            <span key={genre} className={`${genreColors[index]} text-white px-4 py-2 rounded-full text-lg font-medium capitalize transform transition-transform duration-300 hover:scale-105`}>
              {genre}
            </span>
          ))}
        </div>
      </div>
      {/* <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">Most Listened Album</h3>
        {mostListenedAlbum && (
          <div className="flex items-center space-x-4">
            <img src={mostListenedAlbum.images[1].url} alt={mostListenedAlbum.name} className="w-32 h-32 rounded" />
            <div>
              <p className="font-medium text-xl">{mostListenedAlbum.name}</p>
              <p className="text-gray-400 text-lg">{mostListenedAlbum.artists[0].name}</p>
            </div>
          </div>
        )}
      </div> */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 text-indigo-400 border-b border-gray-700 pb-3">Most Listened Album</h3>
        {mostListenedAlbum && (
          <div className="flex items-center space-x-6 mt-4">
            <div className="relative">
              <img 
                src={mostListenedAlbum.images[1].url} 
                alt={mostListenedAlbum.name} 
                className="w-40 h-40 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105" 
              />
              <div className="absolute inset-0 rounded-xl bg-black opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div>
              <p className="font-bold text-2xl text-white mb-2 line-clamp-2">{mostListenedAlbum.name.slice(0,20)}</p>
              <p className="text-gray-400 text-lg font-medium">{mostListenedAlbum.artists[0].name}</p>
            </div>
          </div>
        )}
      </div>
      {/* <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-red-400">Your Favorite Music Era</h3>
        <div className="space-y-2">
          <p className="text-lg">
            {timeRangeText[timeRange]}, you loved music from the <span className="text-yellow-400 font-bold">{favoriteMusic.decade}s</span>!
          </p>
          <p className="text-md text-gray-400">
            Your top tracks were mostly from {favoriteMusic.year}.
          </p>
        </div>
      </div> */}
      
      </div>
    </div>
  );
};

export default DashboardDefault;