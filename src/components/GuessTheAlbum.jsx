// GuessTheSong component is in charge of the game in which the user gets a snippet of one of their top tracks (from the specified time_range)
// and they have to guess the name of the song. The user selects the length of the snippet (1/8th sec, 1/4th sec, 1/2 sec, and 1 sec), 
// the type of audio (slowed, reversed, or sped up), and then plays the snippet as many times as they want, before choosing their song.
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GuessTheAlbum = ({ token, timeRange }) => {
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [currentAlbum, setCurrentAlbum] = useState(null);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState(''); // tells the user if their guess was correct or incorrect.
    const [isPlaying, setIsPlaying] = useState(false);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
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
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
    };

    //used to combine audio of every song on the album
    const combineAudio = (audioContext, sourceBuffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = sourceBuffer;

        //check amount of songs on the album, and run loop to combine them into one playable entity that can be played by the Web Audio API

        return source;
    };

    // Selects a random album from the list of albums, and resets related fields appropriately.
    const selectRandomAlbum = (albumList) => {
        const randomAlbum = albumList[Math.floor(Math.random() * albumList.length)];
        setCurrentAlbum(randomAlbum);
        setGuess('');
        setFeedback('');
        setIsPlaying(false);
        setFilteredAlbums([]); // Resets filtered albums
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    };

    // Find albums from most listened songs
    const albumCounts = tracks.reduce((acc, track) => {
    acc[track.album.id] = (acc[track.album.id] || 0) + 1;
    return acc;
    }, {});
    const albumsArr = Object.entries(albumCounts);
    setAlbums(albumsArr.map((album) => album.album));

    //used for playing the snippet of the song for the specified snippetLength.
    const playSnippet = async () => {
    if (currentAlbum) {
        setIsPlaying(true);

        const response = await fetch(currentAlbum.preview_url); //gets the preview's url
        const arrayBuffer = await response.arrayBuffer(); //splits up response of audio data into array buffer for processing
        const audioContext = new (window.AudioContext || window.webkitAudioContext)(); //AudioContext is the main interface for Web Audio API, webkitAudioContext is for certain older browsers
        const sourceBuffer = await audioContext.decodeAudioData(arrayBuffer); //makes arrayBuffer => audioBuffer for manipulation and playback using Web Audio API
        
        const source = combineAudio(audioContext, sourceBuffer); //combines audio of each song on the album
        source.connect(audioContext.destination);//connects audio to speakers

        const startTime = audioContext.currentTime;
        source.start(startTime);
        source.stop(startTime + 2000 / 1000);

        setTimeout(() => {
        setIsPlaying(false);
        }, 2000);
    } else {
        setFeedback("Sorry, no preview available for any of the tracks on this album. Let's try another!");
        selectRandomAlbum(albums); // if preview isn't available for any of the songs on this album, selects another album from the list of albums.
    }
    };

    //displays correct or incorrect to the user via our feedback field.
    const handleGuess = () => {
    if (guess.toLowerCase() === currentAlbum.name.toLowerCase()) {
        setFeedback('Correct! Well done!');
    } else {
        setFeedback(`Sorry, the correct answer was "${currentAlbum.name}".`);
    }
    setFilteredAlbums([]); // Resets filtered albums after guessing
    };

    //updates the filteredAlbums array every time the guess input field changes.
    const handleInputChange = (e) => {
        const input = e.target.value;
        setGuess(input);
        setFilteredAlbums(
            albums.filter(album => 
            album.name.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 5)
        );
    };

    //when a album is clicked from the filteredAlbums autocomplete fields, populates guess field.
    const handleAlbumSelection = (album) => {
    setGuess(album.name);
    setFilteredAlbums([]); // Clear filtered albums when a album is selected
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">Guess The Album</h2>
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
            {filteredAlbums.length > 0 && (
                <ul className="mt-1 bg-gray-700 rounded">
                {filteredAlbums.map(album => (
                    <li 
                    key={album.id} 
                    onClick={() => handleAlbumSelection(album)}
                    className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                    >
                    <div className="flex flex-col">
                        <span className="text-white">{album.name}</span>
                        <span className="text-gray-400 text-sm">{album.artists[0].name}</span>
                    </div>
                    <img src={album.images[2].url} alt={album.name} className="w-12 h-12 rounded" />
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
                onClick={() => selectRandomAlbum(albums)}
                className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
            >
                Next Song
            </button>
            </div>
        </div>
    );
};

export default GuessTheAlbum;