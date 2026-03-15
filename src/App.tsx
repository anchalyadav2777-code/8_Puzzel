/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RefreshCw, 
  Trophy, 
  Music, 
  Volume2,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---

const GRID_SIZE = 3;
const WINNING_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 represents the empty space

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

const DUMMY_TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Dreams",
    artist: "SynthWave AI",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/neon1/400/400"
  },
  {
    id: 2,
    title: "Cyber Pulse",
    artist: "Digital Ghost",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/neon2/400/400"
  },
  {
    id: 3,
    title: "Midnight Grid",
    artist: "Retro Future",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/neon3/400/400"
  }
];

// --- Helper Functions ---

const isSolvable = (board: number[]) => {
  let inversions = 0;
  const flatBoard = board.filter(n => n !== 0);
  for (let i = 0; i < flatBoard.length; i++) {
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[i] > flatBoard[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
};

const shuffleBoard = () => {
  let board;
  do {
    board = [...WINNING_BOARD].sort(() => Math.random() - 0.5);
  } while (!isSolvable(board) || JSON.stringify(board) === JSON.stringify(WINNING_BOARD));
  return board;
};

// --- Components ---

export default function App() {
  // Puzzle State
  const [board, setBoard] = useState<number[]>(shuffleBoard);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  // --- Puzzle Logic ---

  const handleTileClick = (index: number) => {
    if (isWon) return;

    const emptyIndex = board.indexOf(0);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
      setMoves(prev => prev + 1);

      if (JSON.stringify(newBoard) === JSON.stringify(WINNING_BOARD)) {
        setIsWon(true);
      }
    }
  };

  const resetGame = () => {
    setBoard(shuffleBoard());
    setMoves(0);
    setIsWon(false);
  };

  // --- Music Logic ---

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  }, []);

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isPlaying]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-cyan-500/30 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />

      <main className="z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Section: Game */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              8-PUZZLE GRID
            </h1>
          </div>

          <div className="relative group">
            {/* Puzzle Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10">
              {board.map((tile, index) => (
                <motion.button
                  key={tile}
                  layout
                  onClick={() => handleTileClick(index)}
                  className={`
                    w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                    ${tile === 0 
                      ? 'bg-transparent' 
                      : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    }
                  `}
                  whileHover={tile !== 0 ? { scale: 1.02 } : {}}
                  whileTap={tile !== 0 ? { scale: 0.95 } : {}}
                >
                  {tile !== 0 && (
                    <span className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                      {tile}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Win Overlay */}
            <AnimatePresence>
              {isWon && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl border border-cyan-500/50"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                  <h2 className="text-3xl font-black text-white mb-2">CONGRATS!</h2>
                  <p className="text-cyan-400 mb-6 font-medium">Solved in {moves} moves</p>
                  <button 
                    onClick={resetGame}
                    className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    PLAY AGAIN
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Game Controls */}
          <div className="flex items-center space-x-8 w-full justify-center">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Moves</p>
              <p className="text-2xl font-mono font-bold text-cyan-400">{moves}</p>
            </div>
            <button 
              onClick={resetGame}
              className="group flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-semibold text-sm">SHUFFLE</span>
            </button>
          </div>
        </div>

        {/* Right Section: Music Player */}
        <div className="flex flex-col items-center lg:items-start space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <Music className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NEON PLAYER
            </h1>
          </div>

          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-purple-500/10">
            {/* Album Art */}
            <div className="relative aspect-square w-full mb-6 rounded-2xl overflow-hidden group">
              <img 
                src={currentTrack.cover} 
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-1 truncate">{currentTrack.title}</h2>
              <p className="text-white/50 font-medium">{currentTrack.artist}</p>
            </div>

            {/* Progress Bar (Visual Only) */}
            <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                animate={{ width: isPlaying ? "100%" : "30%" }}
                transition={{ duration: isPlaying ? 180 : 0.5, ease: "linear" }}
              />
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center lg:justify-between space-x-6 lg:space-x-0">
              <button 
                onClick={prevTrack}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_25px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>

              <button 
                onClick={nextTrack}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            </div>

            {/* Volume Indicator */}
            <div className="mt-8 flex items-center space-x-3 text-white/30 justify-center lg:justify-start">
              <Volume2 className="w-4 h-4" />
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
      />

      {/* Footer */}
      <footer className="absolute bottom-6 text-white/20 text-xs tracking-[0.2em] uppercase font-medium">
        Neon Rhythm System v1.0
      </footer>
    </div>
  );
}
