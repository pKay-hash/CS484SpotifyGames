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
    const isCorrect = (guess === 'higher' && artist2.popularity > artist1.popularity) ||
                      (guess === 'lower' && artist2.popularity < artist1.popularity);

    if (isCorrect) {
      setScore(score + 1);
      setMessage('Correct! Your streak: ' + (score + 1));
    } else {
      setMessage(`Game Over! Your final score: ${score}`);
      setScore(0);
    }

    selectNewPair(artists);
  };

  if (currentPair.length < 2) return <div>Loading...</div>;

  return (
    <div>
      <h2>Higher or Lower</h2>
      <p>Score: {score}</p>
      <p>{message}</p>
      <p>Is {currentPair[1].name} streamed more or less than {currentPair[0].name}?</p>
      <button onClick={() => handleGuess('higher')}>Higher</button>
      <button onClick={() => handleGuess('lower')}>Lower</button>
    </div>
  );
};

export default HigherOrLower;
