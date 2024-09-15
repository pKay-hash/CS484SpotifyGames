import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const BracketCreator = ({ token, timeRange }) => {
  const [items, setItems] = useState([]);
  const [bracket, setBracket] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [itemType, setItemType] = useState('artists');

  useEffect(() => {
    fetchItems();
  }, [token, timeRange, itemType]);

  const fetchItems = async () => {
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
        const uniqueAlbums = [...new Set(tracksResponse.data.items.map(track => track.album.id))];
        response = { data: { items: tracksResponse.data.items.filter((track, index) => 
          uniqueAlbums.indexOf(track.album.id) === index
        )}};
      }
      const fetchedItems = response.data.items;
      setItems(fetchedItems);
      initializeBracket(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Updated to handle variable number of items
  const initializeBracket = (fetchedItems) => {
    const bracketSize = getBracketSize(fetchedItems.length);
    const shuffledItems = fetchedItems.sort(() => 0.5 - Math.random()).slice(0, bracketSize);
    const initialBracket = [shuffledItems.map(item => [item, null])];
    setBracket(initialBracket);
    setCurrentRound(0);
  };

  // Function to determine bracket size
  const getBracketSize = (itemCount) => {
    const sizes = [2, 4, 8, 16, 32, 64, 128];
    return sizes.find(size => size >= itemCount) || 128;
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const newBracket = [...bracket];
    const sourceMatch = newBracket[currentRound][parseInt(source.droppableId)];
    const destMatch = newBracket[currentRound][parseInt(destination.droppableId)];

    // Swap items if dragging between matches
    if (source.droppableId !== destination.droppableId) {
      const temp = sourceMatch[source.index];
      sourceMatch[source.index] = destMatch[destination.index];
      destMatch[destination.index] = temp;
    } else {
      // Reorder within the same match
      const [reorderedItem] = sourceMatch.splice(source.index, 1);
      sourceMatch.splice(destination.index, 0, reorderedItem);
    }

    setBracket(newBracket);
  };

  const advanceRound = () => {
    if (currentRound >= bracket.length - 1) return;

    const nextRound = bracket[currentRound].reduce((acc, match, index) => {
      if (index % 2 === 0) {
        acc.push([match[0] || null, bracket[currentRound][index + 1]?.[0] || null]);
      }
      return acc;
    }, []);

    setBracket([...bracket, nextRound]);
    setCurrentRound(currentRound + 1);
  };

  // Updated renderItem function to include dynamic font sizing
  const renderItem = (item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative w-20 h-20 m-1" // Increased size for better visibility
        >
          <img
            src={itemType === 'artists' ? item.images[0]?.url : item.album.images[0]?.url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-1">
            <span className="text-center break-words" style={{ fontSize: `${Math.max(8, Math.min(14, 100 / item.name.length))}px` }}>
              {item.name}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Bracket Creator</h2>
      <select
        value={itemType}
        onChange={(e) => setItemType(e.target.value)}
        className="mb-4 p-2 bg-gray-700 text-white rounded"
      >
        <option value="artists">Artists</option>
        <option value="tracks">Tracks</option>
        <option value="albums">Albums</option>
      </select>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap justify-center">
          {bracket[currentRound]?.map((match, matchIndex) => (
            <Droppable key={matchIndex} droppableId={matchIndex.toString()} direction="vertical">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-700 p-2 m-2 min-h-[180px] w-[120px]"
                >
                  <h4 className="text-center mb-2">Match {matchIndex + 1}</h4>
                  {match.map((item, index) => item && renderItem(item, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <button
        onClick={advanceRound}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={currentRound >= Math.log2(bracket[0]?.length || 1) - 1}
      >
        {currentRound >= Math.log2(bracket[0]?.length || 1) - 1 ? 'Tournament Complete' : 'Next Round'}
      </button>
    </div>
  );
};

export default BracketCreator;