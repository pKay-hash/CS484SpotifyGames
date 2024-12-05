// Dashboard component is in charge of showing the top portion of the website, and serves as a container for each of our games as well.
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HigherOrLower from './HigherOrLower';
import DashboardDefault from './DashboardDefault';
import GuessTheSong from './GuessTheSong';
import GuessTheAlbum from './GuessTheAlbum';
import TierListCreator from './TierListCreator';
import BracketCreator from './BracketCreator';
import DashboardTopBar from './DashboardTopBar';
import { sanitizeInput } from '../utils/xssProtection';


const Dashboard = ({ token, onLogout, resetDashboard, setResetDashboard }) => {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [loading, setLoading] = useState(true);


  // Fetch user data when the component mounts, setting user state with the response from the API call to the user's profile.
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching user data:', error);
        onLogout(); //if there is no user data, just logout
      }
    };

    fetchUserData();
  }, [token, onLogout]);

  useEffect(() => {
    if (resetDashboard) {
      setCurrentGame(null);
      setResetDashboard(false);
    }
  }, [resetDashboard, setResetDashboard]);

  // Render the game component based on the currentGame state.
  const renderGame = () => {
    switch(currentGame) {
      case 'higherOrLower':
        return <HigherOrLower token={token} timeRange={timeRange} />;
      case 'guessTheSong':
        return <GuessTheSong token={token} timeRange={timeRange} />;
      case 'guessTheAlbum':
        return <GuessTheAlbum token={token} timeRange={timeRange} />;
      case 'tierListCreator':
        return <TierListCreator token={token} timeRange={timeRange} />;
      case 'bracketCreator':
        return <BracketCreator token={token} timeRange={timeRange} />;
      default:
        return <DashboardDefault token={token} timeRange={timeRange} onGameSelect = {setCurrentGame} />;
    }
  };

  // changes the time_range used to make the calls to each of the different games (as well as the dashboard)
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-white text-xl">Loading...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <DashboardTopBar 
        user={user}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onGameSelect={setCurrentGame}
      />
      <div className="flex-grow p-6">
        {renderGame()}
      </div>
    </div>
  );
};
export default Dashboard;