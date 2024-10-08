// GuessTheSong component is in charge of the game in which the user gets a snippet of one of their top tracks (from the specified time_range)
// and they have to guess the name of the song. The user selects the length of the snippet (1/8th sec, 1/4th sec, 1/2 sec, and 1 sec), 
// the type of audio (slowed, reversed, or sped up), and then plays the snippet as many times as they want, before choosing their song.
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; //used for all animations of simple things
import { sanitizeInput } from '../utils/xssProtection';
import { PlayIcon, PauseIcon, ChevronRightIcon } from '@heroicons/react/solid';


const GuessTheSong = ({ token, timeRange }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(''); // tells the user if their guess was correct or incorrect.
  const [snippetLength, setSnippetLength] = useState(1000); // Default to 1 second
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioType, setAudioType] = useState('normal'); //state for audio type (normal, slowed, reversed, sped up)
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [gameStage, setGameStage] = useState('settings');
  const [score, setScore] = useState(0);
  const audioRef = useRef(new Audio());//initalizes HTMLAudioElement instance. Specifies the audio reference url later, as it will change on every track change.

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
    setGameStage('settings'); // Initializes gameStage to first stage for difficulty config
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
      setGameStage('guessing'); //updates gameStage when playSnippet is clicked

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
      setScore(score + 1); // increments score when the guess is correct
    } else {
      setFeedback(`Sorry, the correct answer was "${currentTrack.name}".`);
      setScore(0);
    }
    setFilteredTracks([]); // Resets filtered tracks after guessing
    setGameStage('result'); //updates gameStage to final stage before next song is selected
  };

  //updates the filteredTracks array every time the guess input field changes.
  const handleInputChange = (e) => {
    const input = sanitizeInput(e.target.value);
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

  const fadeInOut = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };

  const slideInOut = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3 }
  };

  const renderSettings = () => (
    <motion.div {...fadeInOut} className="space-y-6">
      <motion.div {...slideInOut} className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-white">Snippet Length</h3>
        <div className="flex justify-between">
          {[125, 250, 500, 1000].map((length) => (
            <motion.button 
              key={length}
              onClick={() => setSnippetLength(length)}
              className={`px-4 py-2 rounded-full ${snippetLength === length ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-200'} hover:bg-green-400 transition duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {length === 1000 ? '1 sec' : `${length/1000} sec`}
            </motion.button>
          ))}
        </div>
      </motion.div>
      <motion.div {...slideInOut} className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-white">Audio Type</h3>
        <div className="flex justify-between">
          {['normal', 'slowed', 'sped', 'reversed'].map((type) => (
            <motion.button 
              key={type}
              onClick={() => setAudioType(type)}
              className={`px-4 py-2 rounded-full capitalize ${audioType === type ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-200'} hover:bg-purple-400 transition duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </motion.div>
      <motion.button 
        onClick={() => setGameStage('playing')}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Start Guessing!
      </motion.button>
    </motion.div>
  );

  const renderPlaying = () => (
    <motion.div {...fadeInOut} className="space-y-6">
      <motion.div {...slideInOut} className="flex justify-center">
        <motion.button 
          onClick={playSnippet} 
          disabled={isPlaying}
          className={`px-8 py-4 rounded-full text-xl font-semibold ${isPlaying ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white transition duration-300 flex items-center`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <PauseIcon className="h-6 w-6 mr-2" /> : <PlayIcon className="h-6 w-6 mr-2" />}
          {isPlaying ? 'Playing...' : 'Play Snippet'}
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {gameStage === 'guessing' && (
          <motion.div {...slideInOut} className="space-y-4">
            <motion.input 
              type="text" 
              value={guess} 
              onChange={handleInputChange}
              placeholder="Type your guess here..."
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <AnimatePresence>
              {filteredTracks.length > 0 && (
                <motion.ul 
                  className="bg-gray-700 rounded-lg"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredTracks.map(track => (
                    <motion.li 
                      key={track.id} 
                      onClick={() => handleTrackSelection(track)}
                      className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                      whileHover={{ backgroundColor: "rgba(75, 85, 99, 1)" }}
                    >
                      <div className="flex flex-col">
                        <span className="text-white">{track.name}</span>
                        <span className="text-gray-400 text-sm">{track.artists[0].name}</span>
                      </div>
                      <img src={track.album.images[2].url} alt={track.album.name} className="w-12 h-12 rounded" />
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
            <motion.button 
              onClick={handleGuess}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Guess
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderResult = () => (
    <motion.div {...fadeInOut} className="space-y-6 text-center">
      <motion.div 
        className={`text-2xl font-bold ${feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {feedback}
      </motion.div>
      <motion.div 
        className="text-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Current Score: <span className="font-bold text-blue-400">{score}</span>
      </motion.div>
      <motion.button 
        onClick={() => selectRandomTrack(tracks)}
        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 flex items-center justify-center mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Next Song <ChevronRightIcon className="h-5 w-5 ml-2" />
      </motion.button>
    </motion.div>
  );

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center text-white"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Guess The Song
      </motion.h2>
      <motion.div 
        className="mb-4 text-center text-xl text-blue-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Current Score: {score}
      </motion.div>
      <AnimatePresence mode="wait">
        {gameStage === 'settings' && renderSettings()}
        {(gameStage === 'playing' || gameStage === 'guessing') && renderPlaying()}
        {gameStage === 'result' && renderResult()}
      </AnimatePresence>
    </div>
  );
};

export default GuessTheSong;