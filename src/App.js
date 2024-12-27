import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://api.example.com/songs'; // Replace with a public API URL

function App() {
    const [gameStarted, setGameStarted] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [questionCounter, setQuestionCounter] = useState(0);
    
    useEffect(() => {
        if (gameStarted && questionCounter < 30) {
            fetchSong();
        }
    }, [gameStarted, questionCounter]);

    const fetchSong = async () => {
        try {
            const response = await axios.get(API_URL);
            //Test songs
            const songData = [
              {
                title:'Number of The Beast',
                artist: "Iron Maiden",
                link: ""
              },
              {
                title:'Nothing Else Matters',
                artist: "Metallica",
                link: ""
              },
              {
                title:'Paranoid',
                artist: "Black Sabbath",
                link: ""
              },
            ];
            // const songData = response.data; // Assume this returns songs in the expected format
            const randomIndex = Math.floor(Math.random() * songData.length);
            const song = songData[randomIndex];
            setCurrentSong(song);
            generateOptions(songData, song.title, song.artist);
        } catch (error) {
            console.error("Error fetching song data", error);
        }
    };

    const generateOptions = (songData, correctTitle, correctArtist) => {
        const shuffledSongs = [...songData].sort(() => 0.5 - Math.random()).slice(0, 3);
        shuffledSongs.push({ title: correctTitle, artist: correctArtist });
        setOptions(shuffledSongs.sort(() => 0.5 - Math.random()));
    };

    const handleOptionClick = (title, artist) => {
        if (title === currentSong.title && artist === currentSong.artist) {
            setScore(score + 1);
        }
        setQuestionCounter(questionCounter + 1);
        fetchSong(); // Fetch next song
    };

    const handleStartGame = () => {
        setScore(0);
        setQuestionCounter(0);
        setGameStarted(true);
    };

    const handleViewHighScores = () => {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        alert(`High Scores: ${highScores.join(', ')}`);
    };

    // Save scores to local storage on game end
    useEffect(() => {
        if (questionCounter >= 30) {
            const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
            highScores.push(score);
            localStorage.setItem('highScores', JSON.stringify(highScores));
            alert(`Game Over! Your score: ${score}`);
            setGameStarted(false);
        }
    }, [questionCounter, score]);

    return (
        <div className="App">
            {!gameStarted ? (
                <div>
                    <h1>Welcome to the Song Guessing Game!</h1>
                    <button onClick={handleStartGame}>Start Game</button>
                    <button onClick={handleViewHighScores}>High Scores</button>
                </div>
            ) : (
                <div>
                    {currentSong && (
                        <div>
                            <h2>Guess the Song!</h2>
                            <audio controls autoPlay>
                                <source src={currentSong.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                            {options.map(option => (
                                <button
                                    key={option.title + option.artist}
                                    onClick={() => handleOptionClick(option.title, option.artist)}>
                                    {option.title} by {option.artist}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;