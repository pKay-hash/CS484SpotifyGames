import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HigherOrLower = ({ token }) => {
  const [artists, setArtists] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTopArtists();
  }, []);

  const fetchTopArtists = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { time_range: 'long_term', limit: 50 }
      });
      setArtists(response.data.items);
      selectNewPair(response.data.items);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  const selectNewPair = (artistList) => {
    const shuffled = [...artistList].sort(() => 0.5 - Math.random());
    setCurrentPair(shuffled.slice(0, 2));
  };

  const handleGuess = (guess) => {
    const [artist1, artist2] = currentPair;
    const rank1 = artists.indexOf(artist1);
    const rank2 = artists.indexOf(artist2);
    const isCorrect = (guess === 'higher' && rank2 < rank1) ||
                      (guess === 'lower' && rank2 > rank1);

    if (isCorrect) {
      setScore(score + 1);
      setMessage(score > 1 ? 'You\'re on a roll!' : 'Correct!');
    } else {
      setMessage(`Game Over! Your final score: ${score}`);
      setScore(0);
    }
    selectNewPair(artists);
  };

  if (currentPair.length < 2) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto text-center font-sans">
      <h2 className="text-3xl font-bold mb-6">Higher or Lower</h2>
      <p className="text-xl mb-4">Score: {score}</p>
      <p className="text-lg mb-6 text-green-400">{message}</p>
      <p className="mb-8 text-lg">
        Do you like <span className="font-bold text-blue-400">{currentPair[1].name}</span> more or less than <span className="font-bold text-blue-400">{currentPair[0].name}</span>?
      </p>
      <div className="space-x-4">
        <button 
          className="px-6 py-2 text-lg font-medium bg-blue-600 rounded-full hover:bg-blue-700 border border-transparent hover:border-blue-400 transition duration-300"
          onClick={() => handleGuess('higher')}>
          Higher
        </button>
        <button 
          className="px-6 py-2 text-lg font-medium bg-red-600 rounded-full hover:bg-red-700 border border-transparent hover:border-red-400 transition duration-300"
          onClick={() => handleGuess('lower')}>
          Lower
        </button>
      </div>
    </div>
  );
};


export default HigherOrLower;
