import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 15, y: 15 };
const GAME_SPEED = 120;

const TRACKS = [
  {
    id: 1,
    title: "Neon City Dreams",
    artist: "AI Trax",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Cyberpunk Synapse",
    artist: "Neural Net",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Quantum Groove",
    artist: "Synth Mind",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Music Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Game Loop
  useEffect(() => {
    if (!isGameRunning || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, isGameRunning, gameOver, food]);

  // Key controls for Snake
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameOver) {
        resetGame();
        return;
      }
      if (e.key === ' ' && !isGameRunning) {
        setIsGameRunning(true);
        return;
      }

      setDirection((prev) => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
            return prev.y !== 1 ? { x: 0, y: -1 } : prev;
          case 'ArrowDown':
          case 's':
            return prev.y !== -1 ? { x: 0, y: 1 } : prev;
          case 'ArrowLeft':
          case 'a':
            return prev.x !== 1 ? { x: -1, y: 0 } : prev;
          case 'ArrowRight':
          case 'd':
            return prev.x !== -1 ? { x: 1, y: 0 } : prev;
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isGameRunning]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsGameRunning(true);
  };

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  // Music Player Controls
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  
  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    skipForward();
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-neutral-950 font-mono text-cyan-50 flex flex-col items-center justify-center p-4 selection:bg-fuchsia-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-[1fr_300px] gap-8 items-start">
        
        {/* Main Game Area */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              NEON SNAKE
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm font-semibold tracking-widest uppercase opacity-80 decoration-fuchsia-500">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">SCORE:</span>
                <span className="text-xl tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-fuchsia-400" />
                <span className="text-fuchsia-400">BEST:</span>
                <span className="text-xl tabular-nums drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">{highScore}</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Game Canvas Container */}
            <div 
              className="relative bg-neutral-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden p-2 shadow-[0_0_30px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] transition-shadow duration-500"
              style={{ width: "fit-content" }}
            >
              <div 
                className="grid bg-black rounded-lg border border-neutral-800"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  width: 'min(90vw, 400px)',
                  height: 'min(90vw, 400px)'
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const isSnakeHead = snake[0].x === x && snake[0].y === y;
                  const isSnakeBody = snake.some((segment, idx) => idx !== 0 && segment.x === x && segment.y === y);
                  const isFood = food.x === x && food.y === y;

                  return (
                    <div
                      key={i}
                      className={`w-full h-full  
                        ${isSnakeHead ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-sm z-10' : ''}
                        ${isSnakeBody ? 'bg-cyan-500/80 shadow-[0_0_5px_rgba(34,211,238,0.5)] rounded-sm' : ''}
                        ${isFood ? 'bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.9)] rounded-full animate-pulse z-10' : ''}
                        ${!isSnakeHead && !isSnakeBody && !isFood ? 'border-[0.5px] border-neutral-900/50' : ''}
                      `}
                    />
                  );
                })}
              </div>

              {/* Overlays */}
              {(!isGameRunning || gameOver) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 rounded-xl">
                  {gameOver ? (
                    <>
                      <h2 className="text-4xl font-bold text-fuchsia-500 mb-2 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">GAME OVER</h2>
                      <p className="text-cyan-100 mb-6 font-semibold">Final Score: {score}</p>
                    </>
                  ) : (
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">READY?</h2>
                  )}
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400 text-cyan-400 font-bold tracking-widest rounded transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] active:scale-95 uppercase"
                  >
                    {gameOver ? 'Play Again' : 'Start Game'} [Space]
                  </button>
                </div>
              )}
            </div>
            {/* Grid decoration markers */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-fuchsia-400 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-fuchsia-400 rounded-full" />
          </div>
          
          <div className="text-neutral-500 text-xs text-center">
            Use WASD or Arrow Keys to move. Space to start/restart.
          </div>
        </div>

        {/* Side Panel: Music Player & Info */}
        <div className="flex flex-col gap-6 md:mt-24">
          
          {/* Music Player Widget */}
          <div className="bg-neutral-900/60 backdrop-blur-lg border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            {/* Decor line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 opacity-50" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="font-bold text-sm tracking-widest text-neutral-400 uppercase">
                Now Playing
              </div>
              <button 
                onClick={toggleMute}
                className="text-neutral-500 hover:text-cyan-400 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <div className="mb-6 relative">
              <div className="absolute -inset-4 bg-fuchsia-500/5 rounded-full blur-xl group-hover:bg-fuchsia-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-center w-full aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700/50 shadow-inner overflow-hidden">
                {/* Audio visualizer fake effect */}
                <div className="flex items-end gap-1 h-12">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 bg-fuchsia-500 rounded-t-sm transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1'}`}
                      style={{ 
                        height: isPlaying ? `${Math.max(10, Math.random() * 40 + 10)}px` : '4px',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="font-bold text-lg truncate text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-cyan-400 opacity-80 truncate">
                {currentTrack.artist}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={skipBack}
                className="p-2 text-neutral-400 hover:text-white transition-colors active:scale-90"
              >
                <SkipBack size={24} fill="currentColor" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-14 h-14 flex items-center justify-center bg-cyan-500 text-black rounded-full hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all active:scale-95"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
              
              <button 
                onClick={skipForward}
                className="p-2 text-neutral-400 hover:text-white transition-colors active:scale-90"
              >
                <SkipForward size={24} fill="currentColor" />
              </button>
            </div>
            
            <audio 
              ref={audioRef}
              src={currentTrack.url}
              onEnded={handleTrackEnd}
              crossOrigin="anonymous"
            />
          </div>

          {/* Tracklist Context */}
          <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50 rounded-xl p-4">
             <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
               Tracklist
             </div>
             <div className="space-y-2">
               {TRACKS.map((track, idx) => (
                 <div 
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${idx === currentTrackIndex ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-neutral-800/50 border border-transparent'}`}
                 >
                   <div className={`text-xs w-4 ${idx === currentTrackIndex ? 'text-cyan-400' : 'text-neutral-600'}`}>
                     {idx + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className={`text-sm truncate ${idx === currentTrackIndex ? 'text-white font-medium' : 'text-neutral-400'}`}>
                       {track.title}
                     </div>
                     <div className="text-xs text-neutral-500 truncate">
                       {track.artist}
                     </div>
                   </div>
                   {idx === currentTrackIndex && isPlaying && (
                     <div className="w-4 h-4 flex items-center justify-center">
                       <Volume2 size={14} className="text-cyan-400 animate-pulse" />
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
