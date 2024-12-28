import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';


// Mock URL to retrieve songs - using JSONPlaceholder to simulate a request
const API_URL = "https://jsonplaceholder.typicode.com/posts";


let player; // Player variable to control YouTube Player

function onPlayerReady(event) {
  console.log("YouTube Player Ready");
    // Player is ready; you can add functionality if needed (e.g., event.setup)
}

function App() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [questionCounter, setQuestionCounter] = useState(0);
    const [unplayedSongs, setUnplayedSongs] = useState([]);
    const [totalSongs, setTotalSongs] = useState([]);
    const [playedSongs, setPlayedSongs] = useState([]);
    const [apiReady, setApiReady] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);

    
    const playerRef = React.useRef(null);

    useEffect(() => {
      if (!window.YT) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);
    
        // Define the global onYouTubeIframeAPIReady function
        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API is ready');
          setApiReady(true); // Mark API as ready in state
        };
      } else {
        // API is already loaded
        window.onYouTubeIframeAPIReady();
      }

      return () => {
        delete window.onYouTubeIframeAPIReady;
      };
    }, []);

    useEffect(() => {
      if (unplayedSongs.length > 0 && gameStarted) {
        debugger;
        loadNextSong(); // Load next song only when unplayedSongs is updated
      }
    }, [unplayedSongs, gameStarted]);

    

    // useEffect(() => {
    //   if(gameStarted && unplayedSongs.length === 0){
    //     setGameOver(true)
      
    //     const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    //     highScores.push(score);
    //     localStorage.setItem('highScores', JSON.stringify(highScores));
    //     alert(`Game Over! Your score: ${score}`);
    //   }
    // }, [unplayedSongs, score]);

    useEffect(() => {
      fetchSongs();
    }, []);

    useEffect(() => {
      if (apiReady) {
        // Create the YouTube Player when API is ready
        player = new window.YT.Player('youtube-player', {
          height: '315',
          width: '560',
          playerVars: {
            autoplay: 1,
            controls: 1,
          },
          events: {
            onReady: () => setPlayerReady(true),
          },
        });
        console.log('Player initialized!!')
      }
    }, [apiReady]);

    useEffect(() => {
      if (gameOver) {
        if (player && typeof player.pauseVideo === 'function') {
          player.pauseVideo(); // Pause the video when the game ends
        }
      }
    }, [gameOver, player]);


    const fetchSongs = async () => {
        try {
            const response = await axios.get(API_URL);
            //Test songs
            const songArray = [
              {
                id: 1,
                title:'Number of The Beast',
                artist: "Iron Maiden",
                link: "https://www.youtube.com/watch?v=WxnN05vOuSM"
              },
              {
                id: 2,
                title:'Nothing Else Matters',
                artist: "Metallica",
                link: "https://www.youtube.com/watch?v=tAGnKpE4NCI"
              },
              {
                id: 3,
                title:'Paranoid',
                artist: "Black Sabbath",
                link: "https://www.youtube.com/watch?v=BOTIIw76qiE"
              },
              {
                id: 4,
                title:'Black',
                artist: "Pearl Jam",
                link: "https://www.youtube.com/watch?v=qgaRVvAKoqQ"
              },
              {
                id: 5,
                title:'Under the Bridge',
                artist: "Red Hot Chilli Peppers",
                link: "https://www.youtube.com/watch?v=GLvohMXgcBo"
              },
              {
                id: 6,
                title:'Enojy The Silence',
                artist: "Depeche Mode",
                link: "https://www.youtube.com/watch?v=94inNNhiY6o"
              },
              {
                id: 7,
                title:'Depois Da Uma',
                artist: "Quim Barreiros",
                link: "https://www.youtube.com/watch?v=uwIoL0WdaBw"
              },
              {
                id: 8,
                title:'Self Esteem',
                artist: "The Offspring",
                link: "https://www.youtube.com/watch?v=EtNZnhxWLHo"
              },
              {
                id: 9,
                title:'Raining Blood',
                artist: "Slayer",
                link: "https://www.youtube.com/watch?v=Gy3BOmvLf2w"
              },
              {
                id: 10,
                title:'Frozen',
                artist: "Madonna",
                link: "https://www.youtube.com/watch?v=XS088Opj9o0"
              },
            ];
            setUnplayedSongs(songArray);
            setTotalSongs(songArray);  
            setPlayedSongs([]);      
            
        } catch (error) {
            console.error("Error fetching song data", error);
        }
    };

    const generateOptions = (songData, correctTitle, correctArtist) => {
      // Create a set to track used songs and avoid duplicates
      const incorrectSongs = [];
  
      // Generate 3 unique incorrect songs
      while (incorrectSongs.length < 3) {
          const randomSong = songData[Math.floor(Math.random() * songData.length)];
          // Ensure the random song is not the correct one
          if (
              randomSong.title !== correctTitle &&
              randomSong.artist !== correctArtist &&
              !incorrectSongs.some(
                  (song) => song.title === randomSong.title && song.artist === randomSong.artist
              )
          ) {
              incorrectSongs.push(randomSong);
          }
      }
  
      // Combine the correct song with the incorrect options
      const allOptions = [...incorrectSongs, { title: correctTitle, artist: correctArtist }];
      
      // Shuffle the options to randomize their order
      setOptions(allOptions.sort(() => 0.5 - Math.random()));
  };
  

    const handleOptionClick = (title, artist) => {
        if (title === currentSong.title && artist === currentSong.artist) {
            setScore(score + 1);
        }

        prepareForNextSong()
        
    };

    const handleStartGame = () => {
      debugger;
      if (gameOver) {
        setGameOver(false); // Reset game over state when starting a new game
      }
      setScore(0);
      setQuestionCounter(0);
      setGameStarted(true);
      setUnplayedSongs(totalSongs);

    };

    const prepareForNextSong = () => {
      //Remove song form the array
      const updatedUnplayedSongs = unplayedSongs.filter(
        (song) => song.title !== currentSong.title || song.artist !== currentSong.artist
      );
      setUnplayedSongs(updatedUnplayedSongs);

      if(gameStarted && updatedUnplayedSongs.length === 0){
        setGameOver(true);
      }
      else {
        setQuestionCounter(questionCounter + 1);
        setOptions([])
      }
      
      
    }

    const loadNextSong = () => {
      const randomIndex = Math.floor(Math.random() * unplayedSongs.length);
      debugger;
      const song = unplayedSongs[randomIndex];
      console.log("Unplayed songs: ", unplayedSongs)
      generateOptions(totalSongs, song.title, song.artist);
      setCurrentSong(song);
      playedSongs.push(song.id);

      const videoId = new URL(song.link).searchParams.get('v');
      const randomStartTime = Math.floor(Math.random() * 61); // 61 to include 60 as an option

      // Play the selected video using the player
      if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById({
          videoId: videoId,
          startSeconds: randomStartTime,
        });
      } else {
        console.error('Player not initialized yet');
      }
    }


    const handleViewHighScores = () => {
        // const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        // alert(`High Scores: ${highScores.join(', ')}`);
        console.log("Highscores. TBA")
    };

    // Save scores to local storage on game end
    // useEffect(() => {
    //   debugger;
    //     if (gameStarted && unplayedSongs.length === 0) {
    //         const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    //         highScores.push(score);
    //         localStorage.setItem('highScores', JSON.stringify(highScores));
    //         alert(`Game Over! Your score: ${score}`);
    //         setGameStarted(false);
    //     }
    // }, [questionCounter, score]);

    return (
      <div className="App">
        <div id="youtube-player" ref={playerRef} style={{ display: gameStarted ? "block" : "none" }}></div>
        {!gameStarted ? (
          <div className="start-screen">
            <h1>Welcome to the Song Guessing Game!</h1>
            <button disabled={!playerReady} onClick={handleStartGame}>Start Game</button>
            <button onClick={handleViewHighScores}>High Scores</button>
          </div>
        ) : (
            <div className="game-container">
             {gameOver && (   
            <div className="game-over-container">
              <div className="game-over-text">
                <h2>Game over! Your score is {score} </h2>
              </div>
              <button disabled={!playerReady} onClick={handleStartGame}>Play Again</button>
            </div>
             )}
            {!gameOver && currentSong && (
              <div className="game-screen">
                <h2>Guess the Song!</h2>
                <div className="options-container">
                  {options.map((option) => (
                    <button
                      key={option.title + option.artist}
                      onClick={() => handleOptionClick(option.title, option.artist)}
                    >
                      {option.title} by {option.artist}
                    </button>
                  ))}
                </div>
                <div className="score-card">
                  <div className="score-text">
                    Score: {score}
                  </div>
                </div>
              </div>
              
            )}
          </div>
        )}
        <footer>
          <p>&copy; {new Date().getFullYear()} Song Guessing Game</p>
        </footer>
      </div>
    );
    
    
}

export default App;