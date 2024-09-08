import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HigherOrLower from './HigherOrLower';


const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data); //sets user to response from api call to get user
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  //game renderer
  const renderGame = () => {
    switch(currentGame) {
      case 'higherOrLower':
        return <HigherOrLower token={token} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <div>
          <p>Welcome, {user.display_name}!</p>
          <h3>Available Games:</h3>
          <div className="">
            <button onClick={() => setCurrentGame('guessTheSong')}>Guess the Song</button>
            <button onClick={() => setCurrentGame('higherOrLower')}>Higher or Lower</button>
            <button onClick={() => setCurrentGame('guessTheMusician')}>Guess the Musician</button>
            <button onClick={() => setCurrentGame('lyricQuiz')}>Lyric Quiz</button>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      {renderGame()}
    </div>
  );
};

export default Dashboard;