// GuessTheSong component is in charge of the game in which the user gets a snippet of one of their top tracks (from the specified time_range)
// and they have to guess the name of the song. The user selects the length of the snippet (1/8th sec, 1/4th sec, 1/2 sec, and 1 sec), 
// the type of audio (slowed, reversed, or sped up), and then plays the snippet as many times as they want, before choosing their song.
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GuessTheSong = ({ token, timeRange }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(''); // tells the user if their guess was correct or incorrect.
  const [snippetLength, setSnippetLength] = useState(1000); // Default to 1 second
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioType, setAudioType] = useState('normal'); //state for audio type (normal, slowed, reversed, sped up)
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [snippetButtonsDisabled, setSnippetButtonsDisabled] = useState(false); // User shouldn't be able to select snippet length after playing the song once
  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchTracks();
  }, [token, timeRange]);

  const fetchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { limit: 50, time_range: timeRange }
      });
      setTracks(response.data.items);
      selectRandomTrack(response.data.items); //chooses a random track from the response
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  // Selects a random track from the list of tracks, links to audioRef for playback, and resets related fields appropriately.
  const selectRandomTrack = (trackList) => {
    const randomTrack = trackList[Math.floor(Math.random() * trackList.length)];
    setCurrentTrack(randomTrack);
    setGuess('');
    setFeedback('');
    setIsPlaying(false);
    setFilteredTracks([]); // Resets filtered tracks
    setSnippetButtonsDisabled(false); // Re-enables snippet length buttons
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  //used to apply 'audioType' changes (slowed, reversed, sped up) to the audio snippet before playing it.
  const modifyAudio = (audioContext, sourceBuffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = sourceBuffer;

    if (audioType === 'slowed') {
      source.playbackRate.value = 0.75;
    } else if (audioType === 'sped') {
      source.playbackRate.value = 1.25;
    } else if (audioType === 'reversed') {
      Array.prototype.reverse.call(source.buffer.getChannelData(0));
      Array.prototype.reverse.call(source.buffer.getChannelData(1));
    }

    return source;
  };

  //used for playing the snippet of the song for the specified snippetLength.
  const playSnippet = async () => {
    if (currentTrack && currentTrack.preview_url) {
      setIsPlaying(true);
      setSnippetButtonsDisabled(true); // Disable snippet length buttons

      const response = await fetch(currentTrack.preview_url); //gets the preview's url
      const arrayBuffer = await response.arrayBuffer(); //splits up response of audio data into array buffer for processing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)(); //AudioContext is the main interface for Web Audio API, webkitAudioContext is for certain older browsers
      const sourceBuffer = await audioContext.decodeAudioData(arrayBuffer); //makes arrayBuffer => audioBuffer for manipulation and playback using Web Audio API
      
      const source = modifyAudio(audioContext, sourceBuffer); //modifies audio using audioType
      source.connect(audioContext.destination);//connects audio to speakers

      const startTime = audioContext.currentTime;
      source.start(startTime);
      source.stop(startTime + snippetLength / 1000);

      setTimeout(() => {
        setIsPlaying(false);
      }, snippetLength);
    } else {
      setFeedback("Sorry, no preview available for this track. Let's try another!");
      selectRandomTrack(tracks); // if preview isn't available, selects another track from the list of tracks.
    }
  };

  //displays correct or incorrect to the user via our feedback field.
  const handleGuess = () => {
    if (guess.toLowerCase() === currentTrack.name.toLowerCase()) {
      setFeedback('Correct! Well done!');
    } else {
      setFeedback(`Sorry, the correct answer was "${currentTrack.name}".`);
    }
    setFilteredTracks([]); // Resets filtered tracks after guessing
  };

  //updates the filteredTracks array every time the guess input field changes.
  const handleInputChange = (e) => {
    const input = e.target.value;
    setGuess(input);
    setFilteredTracks(
      tracks.filter(track => 
        track.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    );
  };

  //when a track is clicked from the filteredTracks autocomplete fields, populates guess field.
  const handleTrackSelection = (track) => {
    setGuess(track.name);
    setFilteredTracks([]); // Clear filtered tracks when a track is selected
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Guess The Song</h2>
      <div className="mb-4 flex justify-center space-x-2">
        {[125, 250, 500, 1000].map((length) => (
          <button 
            key={length}
            onClick={() => setSnippetLength(length)} 
            disabled={snippetButtonsDisabled}
            className={`px-3 py-1 rounded ${snippetLength === length ? 'bg-blue-600' : 'bg-gray-600'} ${snippetButtonsDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
          >
            {length === 1000 ? '1 sec' : `${length/1000} sec`}
          </button>
        ))}
      </div>
      <div className="mb-4 flex justify-center space-x-2">
        {['normal', 'slowed', 'sped', 'reversed'].map((type) => (
          <button 
            key={type}
            onClick={() => setAudioType(type)} 
            disabled={snippetButtonsDisabled}
            className={`px-3 py-1 rounded capitalize ${audioType === type ? 'bg-green-600' : 'bg-gray-600'} ${snippetButtonsDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="mb-4 flex justify-center">
        <button 
          onClick={playSnippet} 
          disabled={isPlaying}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isPlaying ? 'Playing...' : 'Play Snippet'}
        </button>
      </div>
      <div className="mb-4">
        <input 
          type="text" 
          value={guess} 
          onChange={handleInputChange}
          placeholder="Type your guess here..."
          className="w-full px-3 py-2 bg-gray-700 rounded text-white"
        />
        {filteredTracks.length > 0 && (
          <ul className="mt-1 bg-gray-700 rounded">
            {filteredTracks.map(track => (
              <li 
                key={track.id} 
                onClick={() => handleTrackSelection(track)}
                className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-white">{track.name}</span>
                  <span className="text-gray-400 text-sm">{track.artists[0].name}</span>
                </div>
                <img src={track.album.images[2].url} alt={track.album.name} className="w-12 h-12 rounded" />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4 flex justify-center">
        <button 
          onClick={handleGuess}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Submit Guess
        </button>
      </div>
      {feedback && (
        <div className="text-center text-lg font-semibold">
          {feedback}
        </div>
      )}
      <div className="mt-4 text-center">
        <button 
          onClick={() => selectRandomTrack(tracks)}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          Next Song
        </button>
      </div>
    </div>
  );
};

export default GuessTheSong;