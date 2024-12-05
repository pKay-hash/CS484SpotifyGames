//DashboardTopBar is the section on the top of the page, just below the top of the App.jsx, that shows user information (such as name and profile picture)
//and allows the user to select the time range for their games, and the specific game they are on.

import React from 'react';
import { Clock, Music } from 'lucide-react';

const DashboardTopBar = ({ user, timeRange, onTimeRangeChange, onGameSelect }) => {
  return (
    <div className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* <div className="flex items-center space-x-4">
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
        </div> */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border-2 border-green-500 transition-transform duration-300 hover:scale-105">
              <img 
                src={user.images[0]?.url || '/default-avatar.png'} 
                alt="Profile" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
            </div>
          </div>
          <div>
            <h2 className="
              text-3xl 
              font-bold 
              bg-clip-text 
              text-transparent 
              bg-gradient-to-r 
              from-green-400 
              to-blue-500 
              tracking-tight 
              leading-none
            ">
              Welcome, {user.display_name}
            </h2>
            <p className="text-gray-400 text-sm mt-1 tracking-wide">
              Ready to explore your musical world
            </p>
          </div>
        </div>
        {/* <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            Time Range:
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
          </div> */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 font-medium">Time Range</span>
                <Clock size={16} className="text-gray-400" />
              </div>
              <select 
                value={timeRange} 
                onChange={(e) => onTimeRangeChange(e.target.value)}
                className="
                  bg-gray-800 
                  text-white 
                  rounded-lg 
                  px-3 
                  py-2 
                  text-sm 
                  border 
                  border-gray-700 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-green-500 
                  hover:bg-gray-700 
                  transition-all 
                  duration-300 
                  cursor-pointer
                "
              >
                <option value="short_term">1 Month</option>
                <option value="medium_term">6 Months</option>
                <option value="long_term">All Time</option>
              </select>
            </div>
          
          {/* <div className="flex items-center space-x-2">
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;