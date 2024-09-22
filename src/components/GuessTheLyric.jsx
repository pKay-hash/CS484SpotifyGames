import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeInput } from '../utils/xssProtection';
import { PlayIcon, PauseIcon, ChevronRightIcon } from '@heroicons/react/solid';

const GuessTheLyric = ({ token, timeRange }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [lyricSnippet, setLyricSnippet] = useState('');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [gameStage, setGameStage] = useState('ready');
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTracks();
  }, [token, timeRange]);

  const fetchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { limit: 50, time_range: timeRange }
      });
      console.log('Spotify Tracks Response:', response.data);  // Log the Spotify API response
      if (response.data.items && response.data.items.length > 0) {
        setTracks(response.data.items);
        selectRandomTrack(response.data.items);
      } else {
        setError('No tracks found. Please try a different time range.');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError('Failed to fetch tracks. Please try again later.');
    }
  };

  const selectRandomTrack = async (trackList) => {
    if (trackList && trackList.length > 0) {
      const randomTrack = trackList[Math.floor(Math.random() * trackList.length)];
      setCurrentTrack(randomTrack);
      await fetchLyrics(randomTrack);
    } else {
      setError('No tracks available to select from.');
    }
  };

  const fetchLyrics = async (track) => {
    if (!track || !track.name || !track.artists || track.artists.length === 0) {
      console.error('Invalid track data:', track);
      setError('Invalid track data. Please try again.');
      return;
    }

    try {
      const response = await axios.get(`/api/lyrics`, {
        params: { q: `${track.name} ${track.artists[0].name}` }
      });

      console.log('API Response:', response.data);  // Log the entire response

      if (!response.data || !response.data.response || !response.data.response.hits) {
        throw new Error('Unexpected API response format');
      }

      if (response.data.response.hits.length === 0) {
        throw new Error('No lyrics found');
      }

      // Get a random hit from the search results
      const randomHit = response.data.response.hits[Math.floor(Math.random() * response.data.response.hits.length)];
      
      // Extract a snippet from the highlight or fall back to the title
      const snippet = randomHit.result.highlights?.[0]?.value || randomHit.result.title;

      setLyricSnippet(sanitizeInput(snippet));
      setGameStage('guessing');
      setError(null);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setError(`Failed to fetch lyrics: ${error.message}. Trying another track...`);
      selectRandomTrack(tracks);
    }
  };

  const handleGuess = () => {
    if (guess.toLowerCase() === currentTrack.name.toLowerCase()) {
      setFeedback('Correct! Well done!');
      setScore(score + 1);
    } else {
      setFeedback(`Sorry, the correct answer was "${currentTrack.name}".`);
      setScore(0);
    }
    setFilteredTracks([]);
    setGameStage('result');
  };

  const handleInputChange = (e) => {
    const input = sanitizeInput(e.target.value);
    setGuess(input);
    setFilteredTracks(
      tracks.filter(track => 
        track.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    );
  };

  const handleTrackSelection = (track) => {
    setGuess(track.name);
    setFilteredTracks([]);
  };

  const fadeInOut = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };

  const slideInOut = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3 }
  };

  const renderReady = () => (
    <motion.div {...fadeInOut} className="space-y-6">
      <motion.p {...slideInOut} className="text-center text-lg text-white">
        Ready to guess the song from its lyrics? Click start to begin!
      </motion.p>
      <motion.div className="flex justify-center">
        <motion.button 
          onClick={() => selectRandomTrack(tracks)}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Guessing!
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderGuessing = () => (
    <motion.div {...fadeInOut} className="space-y-6">
      <motion.div {...slideInOut} className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-white">Lyric Snippet:</h3>
        <p className="text-lg text-gray-300 italic">"{lyricSnippet}"</p>
      </motion.div>
      <motion.div {...slideInOut} className="mb-4">
        <input 
          type="text" 
          value={guess} 
          onChange={handleInputChange}
          placeholder="Type your guess here..."
          className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        />
        <AnimatePresence>
          {filteredTracks.length > 0 && (
            <motion.ul 
              className="mt-1 bg-gray-700 rounded-lg"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredTracks.map(track => (
                <motion.li 
                  key={track.id} 
                  onClick={() => handleTrackSelection(track)}
                  className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                  whileHover={{ backgroundColor: "rgba(75, 85, 99, 1)" }}
                >
                  <span className="text-white">{track.name}</span>
                  <span className="text-gray-400 text-sm">{track.artists[0].name}</span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div className="flex justify-center">
        <motion.button 
          onClick={handleGuess}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Submit Guess
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderResult = () => (
    <motion.div {...fadeInOut} className="space-y-6 text-center">
      <motion.div 
        className={`text-2xl font-bold ${feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {feedback}
      </motion.div>
      <motion.div 
        className="text-xl text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Current Score: <span className="font-bold text-blue-400">{score}</span>
      </motion.div>
      <motion.button 
        onClick={() => selectRandomTrack(tracks)}
        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 flex items-center justify-center mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Next Song <ChevronRightIcon className="h-5 w-5 ml-2" />
      </motion.button>
    </motion.div>
  );

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center text-white"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Guess The Lyric
      </motion.h2>
      {error && (
        <motion.div 
          className="mb-4 text-center text-xl text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}
      {!error && (
        <motion.div 
          className="mb-4 text-center text-xl text-blue-300"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Current Score: {score}
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        {gameStage === 'ready' && renderReady()}
        {gameStage === 'guessing' && renderGuessing()}
        {gameStage === 'result' && renderResult()}
      </AnimatePresence>
    </div>
  );
};

export default GuessTheLyric;