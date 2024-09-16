import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BracketCreator = ({ token, timeRange }) => {
  const [items, setItems] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [itemType, setItemType] = useState('artists');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [token, timeRange, itemType]);

  const fetchItems = async () => {
    setError(null);
    try {
      let response;
      if (itemType === 'artists') {
        response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
      } else if (itemType === 'tracks') {
        response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
      } else if (itemType === 'albums') {
        const tracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
        const uniqueAlbums = [...new Map(tracksResponse.data.items.map(track => 
          [track.album.id, { 
            id: track.album.id, 
            name: track.album.name, 
            images: track.album.images,
            artists: track.album.artists
          }]
        )).values()];
        response = { data: { items: uniqueAlbums } };
      }
      const fetchedItems = response.data.items;
      console.log('Fetched items:', fetchedItems);
      setItems(fetchedItems);
      initializeBracket(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items. Please try again.');
    }
  };

  const getBracketSize = (itemCount) => {
    const sizes = [4, 8, 16, 32, 64];
    return sizes.find(size => size >= itemCount) || sizes[sizes.length - 1];
  };

  const initializeBracket = (fetchedItems) => {
    const bracketSize = Math.pow(2, Math.floor(Math.log2(fetchedItems.length)));
    const shuffledItems = fetchedItems.sort(() => 0.5 - Math.random()).slice(0, bracketSize);
    const rounds = Math.log2(bracketSize);
    
    const newBracket = [];
    for (let i = 0; i < rounds; i++) {
      if (i === 0) {
        newBracket.push(shuffledItems);
      } else {
        const roundSize = bracketSize / Math.pow(2, i);
        newBracket.push(Array(roundSize).fill(null));
      }
    }

    console.log('Initialized bracket:', newBracket);
    setBracket(newBracket);
    setCurrentRound(0);
    setCurrentMatchIndex(0);
    setWinner(null);
  };

  const getItemImage = (item) => {
    if (!item) return '';
    if (itemType === 'artists') {
      return item.images[0]?.url;
    } else if (itemType === 'tracks') {
      return item.album.images[0]?.url;
    } else if (itemType === 'albums') {
      return item.images[0]?.url;
    }
    return '';
  };

  const handleSelection = (roundIndex, matchIndex, selectedIndex) => {
    if (roundIndex !== currentRound || matchIndex !== currentMatchIndex) return;

    const newBracket = [...bracket];
    const winner = newBracket[roundIndex][matchIndex * 2 + selectedIndex];

    if (roundIndex === bracket.length - 1) {
      // Final round
      setWinner(winner);
      return;
    }

    newBracket[roundIndex + 1][matchIndex] = winner;
    setBracket(newBracket);

    // Move to the next match or round
    if (matchIndex < Math.floor(newBracket[roundIndex].length / 2) - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      // Check if this round is complete
      const isRoundComplete = newBracket[roundIndex + 1].every((item, index) => item !== null || index >= Math.floor(newBracket[roundIndex].length / 2));
      if (isRoundComplete) {
        setCurrentRound(currentRound + 1);
        setCurrentMatchIndex(0);
      }
    }
  };

  const renderBracketItem = (item, roundIndex, matchIndex, itemIndex) => {
    if (!item) return <div className="bg-gray-700 rounded m-1 p-2 h-16 w-32">Empty</div>;

    const isActive = roundIndex === currentRound && matchIndex === currentMatchIndex;
    const isSelected = roundIndex < currentRound || (roundIndex === currentRound && matchIndex < currentMatchIndex);

    return (
      <div 
        className={`rounded m-1 p-2 flex items-center overflow-hidden h-16 w-32 cursor-pointer
                    ${isActive ? 'bg-blue-600 hover:bg-blue-500' : 
                      isSelected ? 'bg-green-600' : 'bg-gray-600'}`}
        onClick={() => isActive && handleSelection(roundIndex, matchIndex, itemIndex)}
      >
        <img src={getItemImage(item)} alt={item.name} className="w-12 h-12 object-cover rounded mr-2" />
        <span className="text-xs text-white truncate">{item.name}</span>
      </div>
    );
  };

  const renderBracket = () => {
    if (bracket.length === 0) return <div className="text-white">Loading bracket...</div>;

    return (
      <div className="flex justify-center">
        {bracket.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around m-2">
            <h3 className="text-white mb-2 text-center">Round {roundIndex + 1}</h3>
            {Array(Math.ceil(round.length / 2)).fill().map((_, matchIndex) => (
              <div key={matchIndex} className="mb-4 flex flex-col items-center">
                {renderBracketItem(round[matchIndex * 2], roundIndex, matchIndex, 0)}
                <div className="text-white my-1">vs</div>
                {renderBracketItem(round[matchIndex * 2 + 1], roundIndex, matchIndex, 1)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-full mx-auto p-4 bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-white">Bracket Creator</h2>
      <select
        value={itemType}
        onChange={(e) => setItemType(e.target.value)}
        className="mb-4 p-2 bg-gray-700 text-white rounded"
      >
        <option value="artists">Artists</option>
        <option value="tracks">Tracks</option>
        <option value="albums">Albums</option>
      </select>
      {renderBracket()}
      {winner && (
        <div className="mt-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Winner</h3>
          <div className="flex items-center justify-center">
            <img src={getItemImage(winner)} alt={winner.name} className="w-24 h-24 object-cover rounded mr-4" />
            <span className="text-lg">{winner.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketCreator;