import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GuessTheAlbum = ({ token, timeRange }) => {
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [currentAlbum, setCurrentAlbum] = useState(null);
    const [guess, setGuess] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const audioContext = useRef(null);

    useEffect(() => {
        fetchTracks();
    }, [token, timeRange]);

    useEffect(() => {
        if (tracks.length > 0) {
            processAlbums();
        }
    }, [tracks]);

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

    const selectRandomAlbum = (albumList) => {
        const randomAlbum = albumList[Math.floor(Math.random() * albumList.length)];
        setCurrentAlbum(randomAlbum);
        setGuess('');
        setFeedback('');
        setIsPlaying(false);
        setFilteredAlbums([]);
        if (audioContext.current) {
            audioContext.current.close();
        }
    };

    const playSnippet = async () => {
        if (currentAlbum && currentAlbum.tracks.some(track => track.preview_url)) {
            setIsPlaying(true);
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            
            const trackBuffers = await Promise.all(
                currentAlbum.tracks
                    .filter(track => track.preview_url)
                    .map(async track => {
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
            }, 2000);
        } else {
            setFeedback("Sorry, no previews available for this album. Let's try another!");
            selectRandomAlbum(albums);
        }
    };

    const combineAudioBuffers = (context, buffers) => {
        const combinedBuffer = context.createBuffer(
            2,
            context.sampleRate * 2,
            context.sampleRate
        );

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

    const handleGuess = () => {
        if (guess.toLowerCase() === currentAlbum.name.toLowerCase()) {
            setFeedback('Correct! Well done!');
        } else {
            setFeedback(`Sorry, the correct answer was "${currentAlbum.name}".`);
        }
        setFilteredAlbums([]);
    };

    const handleInputChange = (e) => {
        const input = e.target.value;
        setGuess(input);
        setFilteredAlbums(
            albums.filter(album => 
                album.name.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 5)
        );
    };

    const handleAlbumSelection = (album) => {
        setGuess(album.name);
        setFilteredAlbums([]);
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
                    Next Album
                </button>
            </div>
        </div>
    );
};

export default GuessTheAlbum;