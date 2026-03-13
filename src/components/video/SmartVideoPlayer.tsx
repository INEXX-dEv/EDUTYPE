'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  Lock,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface SmartVideoPlayerProps {
  src: string;
  title: string;
  videoId: string;
  maxWatched: number; // max seconds the user has watched
  onProgress: (currentTime: number, maxWatched: number) => void;
  onComplete: () => void;
}

export function SmartVideoPlayer({
  src,
  title,
  videoId,
  maxWatched: initialMaxWatched,
  onProgress,
  onComplete,
}: SmartVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(initialMaxWatched);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showLockMessage, setShowLockMessage] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Hide controls after inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = Math.floor(video.currentTime);
    setCurrentTime(time);

    // Update max watched
    if (time > maxWatched) {
      setMaxWatched(time);
    }

    // Report progress every 5 seconds
    if (time % 5 === 0) {
      onProgress(time, Math.max(maxWatched, time));
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(Math.floor(video.duration));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onComplete();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const seekTime = clickPosition * duration;

    // SMART SEEK: Only allow seeking to already watched areas
    if (seekTime <= maxWatched + 2) {
      video.currentTime = seekTime;
      setCurrentTime(Math.floor(seekTime));
    } else {
      // Show lock message
      setShowLockMessage(true);
      setTimeout(() => setShowLockMessage(false), 2000);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = video.currentTime + seconds;
    // Can only skip back or within watched area
    if (newTime <= maxWatched + 2 || seconds < 0) {
      video.currentTime = Math.max(0, Math.min(newTime, duration));
    } else {
      setShowLockMessage(true);
      setTimeout(() => setShowLockMessage(false), 2000);
    }
  };

  const watchedPercentage = duration > 0 ? (maxWatched / duration) * 100 : 0;
  const currentPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Lock Message */}
      {showLockMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-surface-900/95 backdrop-blur-lg px-6 py-4 rounded-xl border border-surface-700 flex items-center gap-3"
        >
          <Lock className="w-5 h-5 text-amber-400" />
          <span className="text-white text-sm font-medium">
            Bu bölümü izlemeden ileri saramazsınız
          </span>
        </motion.div>
      )}

      {/* Play Button (center, shown when paused) */}
      {!isPlaying && !isBuffering && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={togglePlay}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-brand-500/90 backdrop-blur-sm flex items-center justify-center shadow-glow-lg"
          >
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </motion.div>
        </div>
      )}

      {/* Controls Overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 transition-opacity"
      >
        {/* Title */}
        <div className="mb-3">
          <h4 className="text-white text-sm font-medium">{title}</h4>
        </div>

        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative h-2 bg-surface-700/50 rounded-full cursor-pointer group/progress mb-3"
          onClick={handleSeek}
        >
          {/* Watched area (accessible) */}
          <div
            className="absolute top-0 left-0 h-full bg-brand-500/30 rounded-full"
            style={{ width: `${watchedPercentage}%` }}
          />
          {/* Current position */}
          <div
            className="absolute top-0 left-0 h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${currentPercentage}%` }}
          />
          {/* Lock indicator for unwatched */}
          <div
            className="absolute top-0 h-full bg-surface-600/30 rounded-r-full"
            style={{
              left: `${watchedPercentage}%`,
              width: `${100 - watchedPercentage}%`,
            }}
          />
          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${currentPercentage}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-brand-400 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="white" />}
            </button>
            <button onClick={() => skip(-10)} className="text-white/70 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => skip(10)} className="text-white/70 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-brand-500 h-1"
              />
            </div>

            <span className="text-white/70 text-xs font-mono">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
