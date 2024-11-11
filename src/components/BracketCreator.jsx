import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import { VolumeXIcon, Volume2Icon } from 'lucide-react';

import selectSound from '../assets/selectSound.mp3';
import winnerSound from '../assets/winnerSound.mp3';


const BracketCreator = ({ token, timeRange }) => {
  const [items, setItems] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [itemType, setItemType] = useState('artists');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [winnerRevealed, setWinnerRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });


  //sound hook for select sound
  const [playSelect] = useSound(selectSound, { volume: 0.5 });
  const [playWinner] = useSound(winnerSound, { volume: 0.5 });

  //useEffect hooks for updating items on change of itemType, timeRange, or token
  useEffect(() => {
    fetchItems();
  }, [token, timeRange, itemType]);

  //for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchItems = async () => {
    try {
      let response;
      if (itemType === 'artists') {
        response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
      } else if (itemType === 'tracks') {
        response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
      } else if (itemType === 'albums') {
        const tracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
        const uniqueAlbums = [...new Map(tracksResponse.data.items.map(track => 
          [track.album.id, { 
            id: track.album.id, 
            name: track.album.name, 
            images: track.album.images,
            artists: track.album.artists
          }]
        )).values()];
        response = { data: { items: uniqueAlbums } };
      }
      const fetchedItems = response.data.items;
      console.log('Fetched items:', fetchedItems);
      setItems(fetchedItems);
      initializeBracket(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items. Please try again.');
    }
  };

  const getBracketSize = (itemCount) => {
    const sizes = [4, 8, 16, 32, 64];
    return sizes.find(size => size >= itemCount) || sizes[sizes.length - 1];
  };

  const initializeBracket = (fetchedItems) => {
    const bracketSize = Math.pow(2, Math.floor(Math.log2(fetchedItems.length)));
    const shuffledItems = fetchedItems.sort(() => 0.5 - Math.random()).slice(0, bracketSize);
    const rounds = Math.log2(bracketSize);
    
    const newBracket = [];
    for (let i = 0; i < rounds; i++) {
      if (i === 0) {
        newBracket.push(shuffledItems);
      } else {
        const roundSize = bracketSize / Math.pow(2, i);
        newBracket.push(Array(roundSize).fill(null));
      }
    }

    setBracket(newBracket);
    setCurrentRound(0);
    setCurrentMatchIndex(0);
    setWinner(null);
    setProgress(0);
  };

  const resetBracket = () => {
    setBracket([]);
    setCurrentRound(0);
    setCurrentMatchIndex(0);
    setWinner(null);
    setWinnerRevealed(false);
    setProgress(0);
    setShowConfetti(false);
    setWinnerTrackPreview(null);
    setIsPlaying(false);
    audioRef.current.pause();
    audioRef.current.src = '';
  };

  const handleItemTypeChange = (e) => {
    const newItemType = e.target.value;
    setItemType(newItemType);
    resetBracket();
  };

  const getItemImage = (item) => {
    if (!item) return ''; // Return empty string if item is undefined
    
    if (itemType === 'artists') {
      return item.images && item.images[0] ? item.images[0].url : '';
    } else if (itemType === 'tracks') {
      return item.album && item.album.images && item.album.images[0] 
        ? item.album.images[0].url 
        : '';
    } else if (itemType === 'albums') {
      return item.images && item.images[0] ? item.images[0].url : '';
    }
    return ''; // Fallback empty string if no image is found
  };

  const handleSelection = (roundIndex, matchIndex, selectedIndex) => {
    if (roundIndex !== currentRound || matchIndex !== currentMatchIndex) return;

    playSelect();

    const newBracket = [...bracket];
    const winner = newBracket[roundIndex][matchIndex * 2 + selectedIndex];

    if (roundIndex === bracket.length - 1) {
      // Final round
      setWinner(winner);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setWinnerRevealed(true);
        setShowConfetti(true);
        playWinner(); // Play the winner sound
      }, 500);
      return;
    }

    newBracket[roundIndex + 1][matchIndex] = winner;
    setBracket(newBracket);

    // Update progress
    const totalMatches = bracket.reduce((sum, round) => sum + Math.floor(round.length / 2), 0);
    const completedMatches = currentRound * Math.floor(bracket[0].length / 2) + currentMatchIndex + 1;
    setProgress((completedMatches / totalMatches) * 100);

    // Animate to the next match or round
    setTimeout(() => {
      if (matchIndex < Math.floor(newBracket[roundIndex].length / 2) - 1) {
        setCurrentMatchIndex(currentMatchIndex + 1);
      } else {
        setCurrentRound(currentRound + 1);
        setCurrentMatchIndex(0);
      }
    }, 300);
  };

  const renderBracketItem = (item, roundIndex, matchIndex, itemIndex) => {
    if (!item) return <div className="bg-gray-700 rounded m-1 p-2 h-20 w-full max-w-xs">Empty</div>;

    const imageUrl = getItemImage(item);
    const isActive = roundIndex === currentRound && matchIndex === currentMatchIndex;
    const isSelected = roundIndex < currentRound || (roundIndex === currentRound && matchIndex < currentMatchIndex);
    
    return (
      <motion.div 
        className={`rounded m-1 p-2 flex items-center overflow-hidden h-20 w-full max-w-xs cursor-pointer
                    ${isActive ? 'bg-blue-600 hover:bg-blue-500' : 
                      isSelected ? 'bg-green-600' : 'bg-gray-600'}`}
        onClick={() => isActive && handleSelection(roundIndex, matchIndex, itemIndex)}
        whileHover={isActive ? { scale: 1.05 } : {}}
        whileTap={isActive ? { scale: 0.95 } : {}}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded mr-2" />
        ) : (
          <div className="w-16 h-16 bg-gray-500 rounded mr-2 flex items-center justify-center text-white text-xs">No Image</div>
        )}
        <span className="text-sm text-white truncate flex-1">{item.name}</span>
      </motion.div>
    );
  };

  const renderBracket = () => {
    if (bracket.length === 0) return <div className="text-white">Loading bracket...</div>;

    return (
      <div className="flex justify-start overflow-x-auto pb-4 w-full">
        {bracket.map((round, roundIndex) => (
          <div 
            key={roundIndex} 
            className="flex flex-col items-center flex-grow"
            style={{ minWidth: `${100 / bracket.length}%` }}
          >
            <h3 className="text-white mb-2 text-center">Round {roundIndex + 1}</h3>
            <div className="flex flex-col justify-around h-full w-full">
              {Array(Math.ceil(round.length / 2)).fill().map((_, matchIndex) => (
                <div key={matchIndex} className="mb-8 flex flex-col items-center">
                  {renderBracketItem(round[matchIndex * 2], roundIndex, matchIndex, 0)}
                  <div className="text-white my-1">vs</div>
                  {renderBracketItem(round[matchIndex * 2 + 1], roundIndex, matchIndex, 1)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWinner = () => (
    <AnimatePresence>
      {winnerRevealed && winner && (
        <>
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-800 p-8 rounded-lg shadow-lg text-center relative z-51"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">Winner!</h3>
              <motion.img 
                src={getItemImage(winner)} 
                alt={winner.name} 
                className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
                initial={{ rotate: -180 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              />
              <motion.p 
                className="text-xl text-white mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {winner.name}
              </motion.p>
              <motion.button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setWinnerRevealed(false);
                  setShowConfetti(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.1}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );

  const renderProgressBar = () => (
    <div className="w-full max-w-3xl mx-auto bg-gray-700 rounded-full h-2.5 mb-4">
      <motion.div 
        className="bg-blue-600 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  return (
    <div className="max-w-full mx-auto p-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-white">Bracket Creator</h2>
        <div className="mb-4 flex justify-between items-center">
          <select
            value={itemType}
            onChange={(e) => {
              setItemType(e.target.value);
              resetBracket();
            }}
            className="p-2 bg-gray-700 text-white rounded"
          >
            <option value="artists">Artists</option>
            <option value="tracks">Tracks</option>
            <option value="albums">Albums</option>
          </select>
        </div>
        <div className="w-full flex justify-center">
          {renderProgressBar()}
        </div>
      </div>
      <div className="overflow-x-auto">
        {renderBracket()}
      </div>
      {renderWinner()}
    </div>
  );
};

export default BracketCreator;