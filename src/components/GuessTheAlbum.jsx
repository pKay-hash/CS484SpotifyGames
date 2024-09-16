// GuessTheAlbum is the component in charge of the Guess The Album game, in which people are given a 2-second snippet
// of every song (that has a preview available) of a random album (pooled from the albums of their top 50 tracks),
// played at the same time, and they must guess the name of the album. 

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeInput } from '../utils/xssProtection';
import { PlayIcon, PauseIcon, ChevronRightIcon } from '@heroicons/react/solid';


const GuessTheAlbum = ({ token, timeRange }) => {
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [currentAlbum, setCurrentAlbum] = useState(null);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [gameStage, setGameStage] = useState('ready');
    const [score, setScore] = useState(0);
    const audioContext = useRef(null);

    // whenever timeRange or token changes, fetch new tracks and process into albums
    useEffect(() => {
        fetchTracks();
    }, [token, timeRange]);

    //fetches top 50 tracks for given time_range
    const fetchTracks = async () => {
        try {
            const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { limit: 50, time_range: timeRange }
            });
            setTracks(response.data.items);
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
    };

    useEffect(() => {
        if (tracks.length > 0) {
            processAlbums();
        }
    }, [tracks]);

    //processes into albums from top 50 tracks
    const processAlbums = () => {
        const albumMap = new Map();
        tracks.forEach(track => {
            if (!albumMap.has(track.album.id)) {
                albumMap.set(track.album.id, {...track.album, tracks: []});
            }
            albumMap.get(track.album.id).tracks.push(track);
        });
        setAlbums(Array.from(albumMap.values()));
        selectRandomAlbum(Array.from(albumMap.values()));
    };

    //selects random album for current iteration of game
    const selectRandomAlbum = async (albumList) => {
        const randomAlbum = albumList[Math.floor(Math.random() * albumList.length)];
        // Fetch full album data
        try {
            const response = await axios.get(`https://api.spotify.com/v1/albums/${randomAlbum.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCurrentAlbum(response.data);
        } catch (error) {
            console.error('Error fetching full album data:', error);
            setCurrentAlbum(randomAlbum); // Fallback to original album data if fetch fails
        }
        setGuess('');
        setFeedback('');
        setIsPlaying(false);
        setFilteredAlbums([]);
        setGameStage('ready');
        if (audioContext.current) {
            audioContext.current.close();
        }
    };

    //fetches audio data for tracks and calls function that combines them into a single audio buffer
    const playSnippet = async () => {
        if (currentAlbum && currentAlbum.tracks && currentAlbum.tracks.items.some(track => track.preview_url)) {
            setIsPlaying(true);
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            
            // Filter tracks with preview_url
            const tracksWithPreviews = currentAlbum.tracks.items.filter(track => track.preview_url);
            
            // Randomly select up to 5 tracks
            const selectedTracks = shuffleArray(tracksWithPreviews).slice(0, 5);
            
            //holds all separate trackBuffers
            const trackBuffers = await Promise.all(
                selectedTracks.map(async track => {
                    const response = await fetch(track.preview_url);
                    const arrayBuffer = await response.arrayBuffer();
                    return await audioContext.current.decodeAudioData(arrayBuffer);
                })
            );

            const combinedBuffer = combineAudioBuffers(audioContext.current, trackBuffers);
            const source = audioContext.current.createBufferSource();
            source.buffer = combinedBuffer;
            source.connect(audioContext.current.destination);

            source.start();
            setTimeout(() => {
                source.stop();
                setIsPlaying(false);
                setGameStage('guessing');
            }, 2000);//plays for 2 seconds
        } else {
            setFeedback("Sorry, no previews available for this album. Let's try another!");
            selectRandomAlbum(albums);
        }
    };

    // Helper function to shuffle an array
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };


    //combines all of the tracks into a single buffer to be played by Web Audio API
    const combineAudioBuffers = (context, buffers) => {
        //creates new buffer in the same 2-channel format to be filled with each buffer's data manually
        const combinedBuffer = context.createBuffer(
            2,
            context.sampleRate * 2,
            context.sampleRate
        );
        //goes through each of the buffers and inserts their data into the combined buffer incrementally
        buffers.forEach(buffer => {
            for (let channel = 0; channel < 2; channel++) {
                const channelData = combinedBuffer.getChannelData(channel);
                const bufferChannelData = buffer.getChannelData(channel);
                for (let i = 0; i < bufferChannelData.length; i++) {
                    if (i < channelData.length) {
                        channelData[i] += bufferChannelData[i] / buffers.length;
                    }
                }
            }
        });

        return combinedBuffer;
    };

    //checks guess to the current album's name
    const handleGuess = () => {
        if (guess.toLowerCase() === currentAlbum.name.toLowerCase()) {
            setFeedback('Correct! Well done!');
            setScore(score + 1);
        } else {
            setFeedback(`Sorry, the correct answer was "${currentAlbum.name}".`);
            setScore(0);
        }
        setFilteredAlbums([]);
        setGameStage('result');
    };

    //resets filteredAlbums
    const handleInputChange = (e) => {
        const input = sanitizeInput(e.target.value);
        setGuess(input);
        setFilteredAlbums(
            albums.filter(album => 
                album.name.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 5)
        );
    };


    //when an album is selected from filteredAlbums, it should fill the field for the user's guess.
    const handleAlbumSelection = (album) => {
        setGuess(album.name);
        setFilteredAlbums([]);
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

    const renderReady = () => (
        <motion.div {...fadeInOut} className="space-y-6">
            <motion.p {...slideInOut} className="text-center text-lg text-white">
                Ready to guess the album? Click play to hear a 2-second snippet!
            </motion.p>
            <motion.div className="flex justify-center">
            <motion.button 
                onClick={() => {setGameStage('guessing'); playSnippet();}}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                Start Guessing!
            </motion.button>
            </motion.div>
        </motion.div>
    );

    const renderGuessing = () => (
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
            <motion.div {...slideInOut} className="mb-4">
                <input 
                    type="text" 
                    value={guess} 
                    onChange={handleInputChange}
                    placeholder="Type your guess here..."
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                />
                <AnimatePresence>
                    {filteredAlbums.length > 0 && (
                        <motion.ul 
                            className="mt-1 bg-gray-700 rounded-lg"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredAlbums.map(album => (
                                <motion.li 
                                    key={album.id} 
                                    onClick={() => handleAlbumSelection(album)}
                                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                                    whileHover={{ backgroundColor: "rgba(75, 85, 99, 1)" }}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-white">{album.name}</span>
                                        <span className="text-gray-400 text-sm">{album.artists[0].name}</span>
                                    </div>
                                    <img src={album.images[2].url} alt={album.name} className="w-12 h-12 rounded" />
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </motion.div>
            <motion.div className="flex justify-center">
                <motion.button 
                    onClick={handleGuess}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Submit Guess
                </motion.button>
            </motion.div>
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
                className="text-xl text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                Current Score: <span className="font-bold text-blue-400">{score}</span>
            </motion.div>
            <motion.button 
                onClick={() => selectRandomAlbum(albums)}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 flex items-center justify-center mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Next Album <ChevronRightIcon className="h-5 w-5 ml-2" />
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
                Guess The Album
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
                {gameStage === 'ready' && renderReady()}
                {gameStage === 'guessing' && renderGuessing()}
                {gameStage === 'result' && renderResult()}
            </AnimatePresence>
        </div>
    );
};

export default GuessTheAlbum;