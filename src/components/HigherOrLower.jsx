//The Higher Or Lower Game. This component gathers data from the Spotify API about which artists they've streamed the most 
//in the specified time_range, which comes ranked by default. We create a game with this information that gives people two musicians
//that are from their top 50, and asks which one they think they've liked (or listened to) more. 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon, RefreshIcon } from '@heroicons/react/solid';

const HigherOrLower = ({ token, timeRange }) => {
  const [artists, setArtists] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [highScore, setHighScore] = useState(0);
  const [gameStage, setGameStage] = useState('ready');


  useEffect(() => {
    fetchTopArtists();
  }, [token, timeRange]);

  const fetchTopArtists = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { time_range: timeRange, limit: 50 }
      });
      setArtists(response.data.items);
      selectNewPair(response.data.items);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  //used to select the pair of musicians being compared.
  const selectNewPair = (artistList) => {
    const shuffled = [...artistList].sort(() => 0.5 - Math.random());
    setCurrentPair(shuffled.slice(0, 2));
    setGameStage('playing');
  };

  //handles the user's guess for which musician they think they've liked more.
  const handleGuess = (guess) => {
    const [artist1, artist2] = currentPair;
    const rank1 = artists.indexOf(artist1);
    const rank2 = artists.indexOf(artist2);
    const isCorrect = (guess === 'higher' && rank2 <= rank1) ||
                      (guess === 'lower' && rank2 >= rank1);

    //handles score below
    if (isCorrect) {
      setScore(score + 1);
      setMessage(score > 1 ? 'You\'re on a roll!' : 'Correct! Great Start!');
      selectNewPair(artists);
    } else {
      setMessage(`Game Over! Your final score: ${score}`);
      setHighScore(Math.max(highScore, score));
      setGameStage('gameover');
    }
  };

  

  if (currentPair.length < 2) return <div className="text-center mt-20">Loading...</div>;

  const restartGame = () => {
    setScore(0);
    setMessage('');
    selectNewPair(artists);
  };

  const fadeInOut = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };

  const slideInOut = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3 }
  };

  const renderArtistCard = (artist, isSecond = false) => (
    <motion.div 
      className="bg-gray-700 p-4 rounded-lg shadow-lg text-center"
      initial={isSecond ? { x: 100, opacity: 0 } : { x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img src={artist.images[0].url} alt={artist.name} className="w-64 h-64 mx-auto rounded-full mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>
      {!isSecond && <p className="text-gray-300">Do you stream this artist more or less than: </p>}
    </motion.div>
  );

  const renderPrompt = () => (
    <div>
      <motion.div 
        className="bg-green-700 p-4 rounded-lg shadow-lg text-center"
        initial={{ x: 0, y: -70, opacity: 0 }}
        animate={{ x: 0, y: -70, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">Higher?</h3>
      </motion.div>
      <motion.div 
        className="bg-gray-700 p-4 rounded-lg shadow-lg text-center"
        initial={{ x: 0, y: -20, opacity: 0 }}
        animate={{ x: 0, y: -20, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">or</h3>
      </motion.div>
      <motion.div 
        className="bg-red-700 p-4 rounded-lg shadow-lg text-center"
        initial={{ x: 0, y: 50, opacity: 0 }}
        animate={{ x: 0, y: 50, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">Lower</h3>
      </motion.div>
    </div>
  );

  const renderPlaying = () => (
    <motion.div {...fadeInOut} className="space-y-6">
      <div className="flex justify-between items-center">
        {renderArtistCard(currentPair[1], true)}
        {renderPrompt()}
        {renderArtistCard(currentPair[0], true)}
        
      </div>
      <motion.div {...slideInOut} className="flex justify-center space-x-4">
        <motion.button 
          className="px-6 py-2 text-lg font-medium bg-blue-600 rounded-full hover:bg-blue-700 border border-transparent hover:border-blue-400 transition duration-300 flex items-center"
          onClick={() => handleGuess('higher')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUpIcon className="h-5 w-5 mr-2" />
          Higher
        </motion.button>
        <motion.button 
          className="px-6 py-2 text-lg font-medium bg-red-600 rounded-full hover:bg-red-700 border border-transparent hover:border-red-400 transition duration-300 flex items-center"
          onClick={() => handleGuess('lower')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronDownIcon className="h-5 w-5 mr-2" />
          Lower
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderGameOver = () => (
    <motion.div {...fadeInOut} className="text-center space-y-6">
      <motion.h3 
        className="text-2xl font-bold text-white"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Game Over!
      </motion.h3>
      <motion.p 
        className="text-xl text-gray-300"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Your final score: <span className="font-bold text-blue-400">{score}</span>
      </motion.p>
      <motion.p 
        className="text-lg text-gray-400"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        High score: <span className="font-bold text-green-400">{highScore}</span>
      </motion.p>
      <motion.button 
        className="px-6 py-2 text-lg font-medium bg-green-600 rounded-full hover:bg-green-700 border border-transparent hover:border-green-400 transition duration-300 flex items-center mx-auto"
        onClick={restartGame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RefreshIcon className="h-5 w-5 mr-2" />
        Play Again
      </motion.button>
    </motion.div>
  );

  if (currentPair.length < 2) return <div className="text-center mt-20 text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center text-white"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Higher or Lower
      </motion.h2>
      <motion.div 
        className="mb-4 text-center text-xl text-blue-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Score: {score}
      </motion.div>
      {message && (
        <motion.p 
          className="text-lg mb-6 text-center text-green-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
      <AnimatePresence mode="wait">
        {gameStage === 'playing' && renderPlaying()}
        {gameStage === 'gameover' && renderGameOver()}
      </AnimatePresence>
    </div>
  );
};

export default HigherOrLower;