'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Gauge,
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

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

const formatPlaybackRate = (rate: number) => `${Number.isInteger(rate) ? rate.toFixed(0) : rate.toFixed(2).replace(/0$/, '')}x`;

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
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const lastReportedSecondRef = useRef(-1);

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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [videoError, setVideoError] = useState('');

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

  useEffect(() => {
    setMaxWatched(initialMaxWatched);
  }, [initialMaxWatched]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!showSpeedMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeedMenu]);

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
    if (time % 5 === 0 && lastReportedSecondRef.current !== time) {
      onProgress(time, Math.max(maxWatched, time));
      lastReportedSecondRef.current = time;
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(Math.floor(Number.isFinite(video.duration) ? video.duration : 0));
      setVideoError('');
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onComplete();
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
        setVideoError('');
      } catch {
        // Some browsers may throw transient play() errors even when source is valid.
        if (video.error) {
          setVideoError('Video kaynağı yüklenemedi. Lütfen dosyayı tekrar kontrol edin.');
        }
      }
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

  const handleSetPlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
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
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
        setShowSpeedMenu(false);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        data-video-id={videoId}
        src={src}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          setVideoError('');
        }}
        onLoadedData={() => setVideoError('')}
        onError={() => {
          setIsPlaying(false);
          setIsBuffering(false);
          setVideoError('Video yüklenemedi. Bağlantı veya dosya kaynağını kontrol edin.');
        }}
        preload="metadata"
        playsInline
      />

      {/* Video Error */}
      {videoError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6 text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-white font-medium">{videoError}</p>
            <button
              onClick={togglePlay}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

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
          className="relative h-2.5 bg-slate-800/70 rounded-full cursor-pointer group/progress mb-4 overflow-hidden"
          onClick={handleSeek}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/30 to-sky-700/20 rounded-full" />
          {/* Watched area (accessible) */}
          <div
            className="absolute top-0 left-0 h-full bg-sky-300/25 rounded-full"
            style={{ width: `${watchedPercentage}%` }}
          />
          {/* Current position */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 rounded-full transition-all shadow-[0_0_14px_rgba(56,189,248,0.75)]"
            style={{ width: `${currentPercentage}%` }}
          />
          {/* Lock indicator for unwatched */}
          <div
            className="absolute top-0 h-full bg-slate-500/25 rounded-r-full"
            style={{
              left: `${watchedPercentage}%`,
              width: `${100 - watchedPercentage}%`,
            }}
          />
          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-sky-200 border border-white/70 rounded-full shadow-[0_0_18px_rgba(56,189,248,0.95)] opacity-0 group-hover/progress:opacity-100 transition-opacity"
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
            <div ref={speedMenuRef} className="relative">
              <button
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="flex items-center gap-1.5 text-white/80 hover:text-sky-300 transition-colors text-xs px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10"
                title="Oynatma hızı"
              >
                <Gauge className="w-3.5 h-3.5" />
                {formatPlaybackRate(playbackRate)}
              </button>

              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-11 right-0 w-24 bg-slate-900/95 border border-slate-700 rounded-lg p-1 backdrop-blur-md"
                  >
                    {PLAYBACK_RATES.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSetPlaybackRate(rate)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          playbackRate === rate
                            ? 'bg-sky-500/20 text-sky-200'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {formatPlaybackRate(rate)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
