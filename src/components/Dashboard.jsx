import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HigherOrLower from './HigherOrLower';
import DashboardDefault from './DashboardDefault';
import GuessTheSong from './GuessTheSong';

const Dashboard = ({ token, onLogout }) => {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  const renderGame = () => {
    switch(currentGame) {
      case 'higherOrLower':
        return <HigherOrLower token={token} timeRange={timeRange} />;
      case 'guessTheSong':
        return <GuessTheSong token={token} timeRange={timeRange} />;
      default:
        return <DashboardDefault token={token} timeRange={timeRange} />;
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <div className="bg-gray-800 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold">Welcome, {user?.display_name || 'User'}</h2>
          <div className="space-x-2">
            <select 
              value={timeRange} 
              onChange={handleTimeRangeChange}
              className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="short_term">1 Month</option>
              <option value="medium_term">6 Months</option>
              <option value="long_term">1 Year</option>
            </select>
            <button 
              className="px-3 py-1 text-sm font-medium bg-gray-700 rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
              onClick={() => setCurrentGame('Dashboard')}>
              Dashboard
            </button>
            <button 
              className="px-3 py-1 text-sm font-medium bg-gray-700 rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
              onClick={() => setCurrentGame('guessTheSong')}>
              Guess the Song
            </button>
            <button 
              className="px-3 py-1 text-sm font-medium bg-gray-700 rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
              onClick={() => setCurrentGame('higherOrLower')}>
              Higher or Lower
            </button>
            <button 
              className="px-3 py-1 text-sm font-medium bg-gray-700 rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
              onClick={() => setCurrentGame('guessTheMusician')}>
              Guess the Musician
            </button>
            <button 
              className="px-3 py-1 text-sm font-medium bg-gray-700 rounded-full border border-transparent hover:bg-gray-600 hover:text-gray-300 hover:border-blue-400 transition duration-300"
              onClick={() => setCurrentGame('lyricQuiz')}>
              Lyric Quiz
            </button>
          </div>
        </div>
      </div>
      <div className="flex-grow p-6">
        {renderGame()}
      </div>
    </div>
  );
};
export default Dashboard;