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
  const [showRank, setShowRank] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);


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
    setShowRank(false);
    setIsCorrect(null);
    
  };

  //handles the user's guess for which musician they think they've liked more.
  const handleGuess = (guess) => {
    const [artist1, artist2] = currentPair;
    const rank1 = artists.indexOf(artist1);
    const rank2 = artists.indexOf(artist2);
    const correct = (guess === 'higher' && rank2 <= rank1) ||
                      (guess === 'lower' && rank2 >= rank1);

    setIsCorrect(correct);
    setShowRank(true);
    setGameStage('revealing');
                  
    //handles score below
    if (correct) {
      setScore(score + 1);
      setMessage(score > 1 ? 'You\'re on a roll!' : 'Correct! Great Start!');
      setTimeout(() => {
        selectNewPair(artists);
      }, 3000);
    } else {
      setMessage(`Game Over! Your final score: ${score}`);
      setHighScore(Math.max(highScore, score));
      setTimeout(() => {
        setGameStage('gameover');
      }, 3000);
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
      className="flex flex-col items-center justify-center w-full h-full bg-gray-800 p-6 rounded-lg shadow-xl"
      initial={isSecond ? { x: '100%' } : { x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <motion.img 
        src={artist.images[0].url} 
        alt={artist.name} 
        className="w-64 h-64 rounded-full mb-6 object-cover"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.h3 
        className="text-3xl font-bold text-white mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {artist.name}
      </motion.h3>
      <AnimatePresence>
        {showRank && (
          <motion.p 
            className="text-xl text-green-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4 }}
          >
            Rank: #{artists.indexOf(artist) + 1}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 flex items-center justify-center">
        {renderArtistCard(currentPair[0])}
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <motion.p 
          className="text-2xl font-bold text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Is {currentPair[1].name} streamed more or less?
        </motion.p>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <motion.button 
            className="px-8 py-4 text-xl font-medium bg-blue-600 rounded-full hover:bg-blue-700 border border-transparent hover:border-blue-400 transition duration-300 flex items-center"
            onClick={() => handleGuess('higher')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUpIcon className="h-6 w-6 mr-2" />
            Higher
          </motion.button>
          <motion.button 
            className="px-8 py-4 text-xl font-medium bg-red-600 rounded-full hover:bg-red-700 border border-transparent hover:border-red-400 transition duration-300 flex items-center"
            onClick={() => handleGuess('lower')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDownIcon className="h-6 w-6 mr-2" />
            Lower
          </motion.button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {renderArtistCard(currentPair[1], true)}
      </div>
    </div>
  );

  const renderGameOver = () => (
    <motion.div 
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-4xl font-bold text-white mb-6">Game Over!</h3>
      <p className="text-2xl text-gray-300 mb-4">
        Your final score: <span className="font-bold text-blue-400">{score}</span>
      </p>
      <p className="text-xl text-gray-400 mb-8">
        High score: <span className="font-bold text-green-400">{highScore}</span>
      </p>
      <motion.button 
        className="px-8 py-4 text-xl font-medium bg-green-600 rounded-full hover:bg-green-700 border border-transparent hover:border-green-400 transition duration-300 flex items-center"
        onClick={restartGame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RefreshIcon className="h-6 w-6 mr-2" />
        Play Again
      </motion.button>
    </motion.div>
  );

  const renderRevealing = () => (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 flex items-center justify-center">
        {renderArtistCard(currentPair[0])}
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <motion.p 
          className={`text-2xl font-bold mb-6 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {isCorrect ? 'Correct!' : 'Wrong!'}
        </motion.p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {renderArtistCard(currentPair[1], true)}
      </div>
    </div>
  );

  if (currentPair.length < 2) return <div className="text-center mt-20 text-white">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900">
      <div className="flex-none bg-gray-800 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Higher or Lower</h2>
          <p className="text-xl text-blue-300">Score: {score}</p>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          {gameStage === 'playing' && renderPlaying()}
          {gameStage === 'revealing' && renderRevealing()}
          {gameStage === 'gameover' && renderGameOver()}
        </AnimatePresence>
      </div>
      {message && (
        <motion.div 
          className="flex-none bg-gray-800 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <p className="text-center text-xl text-green-400">{message}</p>
        </motion.div>
      )}
    </div>
  );
};

export default HigherOrLower;