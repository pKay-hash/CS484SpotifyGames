//The TierListCreator component is in charge of allowing people to create their own Tier list of musically related things! This may include,
// but is not limited to, their top tracks, top artists, albums, etc. This component is similar to the BracketCreator component, in that it 
// allows people to create something that they can give other people to play, as opposed to just having a game that they can play
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TierListCreator = ({ token, timeRange }) => {
  const [items, setItems] = useState([]); //the things to be tier-listed
  const [tiers, setTiers] = useState({
    S: [], A: [], B: [], C: [], D: [], E: [], F: [], Unranked: []
  }); // holds items in each tier
  const [itemType, setItemType] = useState('albums'); //defaults to tier-listing albums

  //classnames for coloring attributes for each of the tiers
  const tierColors = {
    S: 'bg-blue-200 text-blue-800',
    A: 'bg-green-200 text-green-800',
    B: 'bg-lime-200 text-lime-800',
    C: 'bg-yellow-200 text-yellow-800',
    D: 'bg-orange-200 text-orange-800',
    E: 'bg-red-200 text-red-800',
    F: 'bg-red-300 text-red-900',
    Unranked: 'bg-gray-200 text-gray-800'
  };

  //gets items on token, timeRange, or itemType change
  useEffect(() => {
    fetchItems();
  }, [token, timeRange, itemType]);

  const fetchItems = async () => {
    try {
      let fetchedItems = [];
      if (itemType === 'artists') {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
        fetchedItems = response.data.items;
      } else if (itemType === 'tracks') {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { time_range: timeRange, limit: 50 }
        });
        fetchedItems = response.data.items;
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
        fetchedItems = uniqueAlbums;
      }
      setItems(fetchedItems);
      resetTiers(fetchedItems); //should reset tiers when changes happen (to itemType and timeRange)
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  //resets the tiers to blank
  const resetTiers = (newItems) => {
    setTiers(prevTiers => ({
      ...Object.fromEntries(Object.keys(prevTiers).map(key => [key, []])),
      Unranked: newItems
    }));
  };

  //takes care of Draggable
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    const newTiers = { ...tiers };
    const [movedItem] = newTiers[sourceKey].splice(source.index, 1);
    newTiers[destKey].splice(destination.index, 0, movedItem);

    setTiers(newTiers);
  };

  //needs varied image obtaining, as getting an image for an item is different depending on if it is for an artist, track, or album.
  const getItemImage = (item) => {
    if (itemType === 'artists') {
      return item.images[0]?.url;
    } else if (itemType === 'tracks') {
      return item.album.images[0]?.url;
    } else if (itemType === 'albums') {
      return item.images[0]?.url;
    }
    return ''; // Fallback empty string if no image is found
  };

  //creation of Draggable components
  const renderItem = (item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative w-16 h-16 m-1" 
        >
          <img
            src={getItemImage(item)}
            alt={item.name}
            className="w-full h-full object-cover rounded"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-1 rounded">
            <span className="text-center break-words text-xs">
              {item.name}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );

  //manually handles resetting of itemType, due to some unforeseen problems
  const handleItemTypeChange = (e) => {
    setItemType(e.target.value);
    setItems([]);
    resetTiers([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tier List Creator</h2>
      <select
        value={itemType}
        onChange={handleItemTypeChange}
        className="mb-4 p-2 bg-gray-700 text-white rounded"
      >
        <option value="artists">Artists</option>
        <option value="tracks">Tracks</option>
        <option value="albums">Albums</option>
      </select>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col space-y-2">
          {Object.entries(tiers).map(([tier, tierItems]) => (
            <div key={tier} className="flex items-stretch">
              {tier !== 'Unranked' && (
                <div className={`w-10 font-bold text-xl flex items-center justify-center rounded-l ${tierColors[tier]}`}>
                  {tier}
                </div>
              )}
              <Droppable droppableId={tier} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-wrap p-2 min-h-[88px] ${tier !== 'Unranked' ? 'rounded-r' : 'rounded'} ${tierColors[tier].split(' ')[0]} bg-opacity-10`}
                  >
                    {tierItems.map((item, index) => renderItem(item, index))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TierListCreator;