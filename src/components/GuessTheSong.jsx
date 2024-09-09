import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GuessTheSong = ({ token, timeRange }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [snippetLength, setSnippetLength] = useState(1000); // Default to 1 second
  const [isPlaying, setIsPlaying] = useState(false);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchTracks();
  }, [token, timeRange]);

  const fetchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { limit: 50, time_range: timeRange }
      });
      setTracks(response.data.items);
      selectRandomTrack(response.data.items);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const selectRandomTrack = (trackList) => {
    const randomTrack = trackList[Math.floor(Math.random() * trackList.length)];
    setCurrentTrack(randomTrack);
    setGuess('');
    setFeedback('');
    setIsPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const playSnippet = () => {
    if (currentTrack && currentTrack.preview_url) {
      audioRef.current.src = currentTrack.preview_url;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current.pause();
        setIsPlaying(false);
      }, snippetLength);
    } else {
      setFeedback("Sorry, no preview available for this track. Let's try another!");
      selectRandomTrack(tracks);
    }
  };

  const handleGuess = () => {
    if (guess.toLowerCase() === currentTrack.name.toLowerCase()) {
      setFeedback('Correct! Well done!');
    } else {
      setFeedback(`Sorry, the correct answer was "${currentTrack.name}".`);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setGuess(input);
    setFilteredTracks(
      tracks.filter(track => 
        track.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Guess The Song</h2>
      <div className="mb-4 flex justify-center space-x-2">
        <button 
          onClick={() => setSnippetLength(125)} 
          className={`px-3 py-1 rounded ${snippetLength === 125 ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          1/8 sec
        </button>
        <button 
          onClick={() => setSnippetLength(250)} 
          className={`px-3 py-1 rounded ${snippetLength === 250 ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          1/4 sec
        </button>
        <button 
          onClick={() => setSnippetLength(500)} 
          className={`px-3 py-1 rounded ${snippetLength === 500 ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          1/2 sec
        </button>
        <button 
          onClick={() => setSnippetLength(1000)} 
          className={`px-3 py-1 rounded ${snippetLength === 1000 ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          1 sec
        </button>
      </div>
      <div className="mb-4 flex justify-center">
        <button 
          onClick={playSnippet} 
          disabled={isPlaying}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isPlaying ? 'Playing...' : 'Play Snippet'}
        </button>
      </div>
      <div className="mb-4">
        <input 
          type="text" 
          value={guess} 
          onChange={handleInputChange}
          placeholder="Type your guess here..."
          className="w-full px-3 py-2 bg-gray-700 rounded text-white"
        />
        {filteredTracks.length > 0 && (
          <ul className="mt-1 bg-gray-700 rounded">
            {filteredTracks.map(track => (
              <li 
                key={track.id} 
                onClick={() => setGuess(track.name)}
                className="px-3 py-1 hover:bg-gray-600 cursor-pointer"
              >
                {track.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4 flex justify-center">
        <button 
          onClick={handleGuess}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Submit Guess
        </button>
      </div>
      {feedback && (
        <div className="text-center text-lg font-semibold">
          {feedback}
        </div>
      )}
      <div className="mt-4 text-center">
        <button 
          onClick={() => selectRandomTrack(tracks)}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          Next Song
        </button>
      </div>
    </div>
  );
};

export default GuessTheSong;