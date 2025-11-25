import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Reset state when url changes
    setIsPlaying(false);
    if(audioRef.current) {
        audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (!audioUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} />
      <button 
        onClick={togglePlay}
        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </>
  );
};

export default AudioPlayer;