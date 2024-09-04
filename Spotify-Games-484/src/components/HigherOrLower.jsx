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

  //api call to fetch the top artists of the user
  const fetchTopArtists = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { time_range: 'long_term', limit: 50 } //sets limit to 50, and time_range to long_term (meaning 1 year)
      });
      setArtists(response.data.items);
      selectNewPair(response.data.items);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  const selectNewPair = (artistList) => {
    const shuffled = [...artistList].sort(() => 0.5 - Math.random()); //shuffles the list of artists
    setCurrentPair(shuffled.slice(0, 2)); //gets the first two from the shuffled list of artists
  };

  const handleGuess = (guess) => {
    const [artist1, artist2] = currentPair;
    const rank1 = artists.indexOf(artist1);
    const rank2 = artists.indexOf(artist2);
    artists.map((artist) => {console.log(artist.name)});
    const isCorrect = (guess === 'higher' && rank2 < rank1) ||
                      (guess === 'lower' && rank2 > rank1);

    if (isCorrect) {
      setScore(score + 1);
      if(score > 1) {
        setMessage('You\'re on a roll!')
      }
      else {
        setMessage('Correct!');
      }
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
      <p>Do you like {currentPair[1].name} more or less than {currentPair[0].name}?</p>
      <button onClick={() => handleGuess('higher')}>Higher</button>
      <button onClick={() => handleGuess('lower')}>Lower</button>
    </div>
  );
};

export default HigherOrLower;
