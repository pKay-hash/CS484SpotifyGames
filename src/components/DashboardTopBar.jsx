import React from 'react';
import { Clock, Music } from 'lucide-react';

const DashboardTopBar = ({ user, timeRange, onTimeRangeChange, onGameSelect }) => {
  return (
    <div className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-green-500">
            <img 
              src={user.images[0]?.url} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold text-white">
            Welcome, {user.display_name}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-400" />
            <select 
              value={timeRange} 
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="short_term">1 Month</option>
              <option value="medium_term">6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Music size={16} className="text-gray-400" />
            <select
              onChange={(e) => onGameSelect(e.target.value)}
              className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Dashboard</option>
              <option value="guessTheSong">Guess the Song</option>
              <option value="higherOrLower">Higher or Lower</option>
              <option value="guessTheAlbum">Guess the Album</option>
              <option value="tierListCreator">Tier List Creator</option>
              <option value="bracketCreator">Bracket Creator</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;