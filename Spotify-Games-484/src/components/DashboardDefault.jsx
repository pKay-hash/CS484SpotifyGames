import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardDefault = ({ token }) => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [favoriteMusic, setFavoriteMusic] = useState({ year: null, decade: null });
  const [mostListenedAlbum, setMostListenedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [tracksResponse, artistsResponse] = await Promise.all([
          axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { limit: 50, time_range: 'long_term' }
          }),
          axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { limit: 5, time_range: 'long_term' }
          })
        ]);

        setTopTracks(tracksResponse.data.items.slice(0, 5));
        setTopArtists(artistsResponse.data.items);

        // Calculate favorite year and decade
        const yearCounts = tracksResponse.data.items.reduce((acc, track) => {
          const year = new Date(track.album.release_date).getFullYear();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});

        const favoriteYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0][0];
        const favoriteDecade = Math.floor(favoriteYear / 10) * 10;

        setFavoriteMusic({ year: favoriteYear, decade: favoriteDecade });

        // Get recommendations
        const seedArtists = artistsResponse.data.items.slice(0, 2).map(artist => artist.id).join(',');
        const seedTracks = tracksResponse.data.items.slice(0, 2).map(track => track.id).join(',');
        const recommendationsResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            seed_artists: seedArtists,
            seed_tracks: seedTracks,
            limit: 5
          }
        });
        setRecommendations(recommendationsResponse.data.tracks);

        // Calculate favorite genres
        const genreCounts = artistsResponse.data.items.flatMap(artist => artist.genres)
          .reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
          }, {});
        setFavoriteGenres(Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([genre]) => genre));

        // Find most listened album
        const albumCounts = tracksResponse.data.items.reduce((acc, track) => {
          acc[track.album.id] = (acc[track.album.id] || 0) + 1;
          return acc;
        }, {});
        const mostListenedAlbumId = Object.entries(albumCounts)
          .sort((a, b) => b[1] - a[1])[0][0];
        setMostListenedAlbum(tracksResponse.data.items.find(track => track.album.id === mostListenedAlbumId).album);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading your personalized dashboard...</div>;
  }

  const genreColors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto p-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Your Top Tracks</h3>
        <ul className="space-y-4">
          {topTracks.map((track, index) => (
            <li key={track.id} className="flex items-center space-x-4">
              <img src={track.album.images[2].url} alt={track.name} className="w-16 h-16 rounded" />
              <div>
                <span className="font-medium text-lg">{track.name}</span>
                <p className="text-gray-400">{track.artists[0].name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-green-400">Your Top Artists</h3>
        <ul className="space-y-4">
          {topArtists.map((artist, index) => (
            <li key={artist.id} className="flex items-center space-x-4">
              <img src={artist.images[2].url} alt={artist.name} className="w-16 h-16 rounded-full" />
              <span className="font-medium text-lg">{artist.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-purple-400">Recommended Tracks</h3>
        <ul className="space-y-4">
          {recommendations.map((track, index) => (
            <li key={track.id} className="flex items-center space-x-4">
              <img src={track.album.images[2].url} alt={track.name} className="w-16 h-16 rounded" />
              <div>
                <span className="font-medium text-lg">{track.name}</span>
                <p className="text-gray-400">{track.artists[0].name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-center items-center">
        <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Your Favorite Genres</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {favoriteGenres.map((genre, index) => (
            <span key={genre} className={`${genreColors[index]} text-white px-4 py-2 rounded-full text-lg font-medium capitalize`}>
              {genre}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-red-400">Your Favorite Music Era</h3>
        <div className="space-y-2">
          <p className="text-lg">
            You love music from the <span className="text-yellow-400 font-bold">{favoriteMusic.decade}s</span>!
          </p>
          <p className="text-md text-gray-400">
            Your top tracks are mostly from {favoriteMusic.year}.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">Most Listened Album</h3>
        {mostListenedAlbum && (
          <div className="flex items-center space-x-4">
            <img src={mostListenedAlbum.images[1].url} alt={mostListenedAlbum.name} className="w-32 h-32 rounded" />
            <div>
              <p className="font-medium text-xl">{mostListenedAlbum.name}</p>
              <p className="text-gray-400 text-lg">{mostListenedAlbum.artists[0].name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDefault;