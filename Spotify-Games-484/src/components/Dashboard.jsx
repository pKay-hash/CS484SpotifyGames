import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);

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

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <div>
          <p>Welcome, {user.display_name}!</p>
          <h3>Available Games:</h3>
          <ul>
            <li>Guess the Song</li>
            <li>Higher or Lower</li>
            <li>Guess the Musician</li>
            <li>Lyric Quiz</li>
          </ul>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;