//The TierListCreator component is in charge of allowing people to create their own Tier list of musically related things! This may include,
// but is not limited to, their top tracks, top artists, albums, etc. This component is similar to the BracketCreator component, in that it 
// allows people to create something that they can give other people to play, as opposed to just having a game that they can play
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const TierListCreator = ({ token, timeRange }) => {
  const [items, setItems] = useState([]);
  const [tiers, setTiers] = useState({
    S: [], A: [], B: [], C: [], D: [], E: [], F: [], Unranked: []
  }); // holds items in each tier
  const [itemType, setItemType] = useState('albums');

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
        //uses.filter to filter out duplicates from albums.
        const uniqueAlbums = [...new Set(tracksResponse.data.items.map(track => track.album.id))];
        response = { data: { items: tracksResponse.data.items.filter((track, index) => 
          uniqueAlbums.indexOf(track.album.id) === index
        )}};
      }
      setItems(response.data.items);
      setTiers(prevTiers => ({ ...prevTiers, Unranked: response.data.items }));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  //used for drag and drop functionality
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

  //adds Draggable components from @hello-pangea/dnd for each of the items being rendered depending on value of itemType
  const renderItem = (item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative w-20 h-20 m-1" 
        >
          <img
            src={itemType !== 'artists' ? item.album.images[0]?.url : item.images[0]?.url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-1">
            <span className="text-center break-words" style={{ fontSize: `${Math.max(8, Math.min(14, 100 / item.name.length))}px` }}>
              {item.name}
              {/* TODO need to fix this for albums (needs to show album name, and not the name of the track that was used to get the album) */}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tier List Creator</h2>
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
        {Object.entries(tiers).map(([tier, tierItems]) => (
          <Droppable key={tier} droppableId={tier} direction="horizontal">
            {(provided) => (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{tier}</h3>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap bg-gray-700 p-2 min-h-[100px]"
                >
                  {tierItems.map((item, index) => renderItem(item, index))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default TierListCreator;