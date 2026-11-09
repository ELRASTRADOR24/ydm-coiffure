"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export default function CustomVideoPlayer({
  src,
  poster,
  title,
  autoPlay = true,
  loop = true,
  className = "",
  initialPortrait = true,
  onOrientationChange,
  isMuted: externalMuted,
  onMuteChange,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const animationFrameRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(externalMuted ?? true); // Toujours muet par défaut
  const [volume, setVolume] = useState(0.85);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Synchronisation avec l'état externe si fourni
  useEffect(() => {
    if (externalMuted !== undefined && videoRef.current) {
      videoRef.current.muted = externalMuted;
      setIsMuted(externalMuted);
    }
  }, [externalMuted]);

  // Synchronisation 60fps continue sans lag CSS
  const updateProgress = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration && !isNaN(video.duration) && !isScrubbing) {
      const cur = video.currentTime;
      const dur = video.duration;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);
    }
    if (isPlaying && !isScrubbing) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, isScrubbing]);

  useEffect(() => {
    if (isPlaying && !isScrubbing) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isScrubbing, updateProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Strictement muet par défaut dès le montage
    video.muted = true;
    video.volume = volume;
    setIsMuted(true);

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
      if (video.videoWidth && video.videoHeight) {
        const portrait = video.videoHeight >= video.videoWidth;
        if (onOrientationChange) {
          onOrientationChange(portrait);
        }
      }
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing && video.duration && !isNaN(video.duration)) {
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (!loop) {
        setIsPlaying(false);
        setShowControls(true);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    if (autoPlay) {
      video.muted = true;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src, autoPlay, loop, onOrientationChange, isScrubbing, volume]);

  // Clic sur la vidéo pour basculer Lecture / Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  // Bouton son épuré (icône + état, silencieux par défaut)
  const toggleMute = (e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = volume > 0 ? volume : 0.85;
    }
    setIsMuted(nextMuted);
    onMuteChange?.(nextMuted);
  };

  // Calcul instantané de la position de la barre de progression (clic ou glisser)
  const seekFromPointer = useCallback((e) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar || !video.duration || isNaN(video.duration)) return;

    const rect = bar.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = clampedX / rect.width;
    const targetTime = ratio * video.duration;

    video.currentTime = targetTime;
    setCurrentTime(targetTime);
    setProgress(ratio * 100);
  }, []);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    setIsScrubbing(true);
    seekFromPointer(e);
  };

  const handlePointerMove = (e) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    seekFromPointer(e);
  };

  const handlePointerUp = (e) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsScrubbing(false);
    seekFromPointer(e);
  };

  const toggleFullscreen = (e) => {
    e?.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isScrubbing) setShowControls(false);
      }, 3500);
    }
  };

  const formatSeconds = (sec) => {
    if (isNaN(sec) || !sec || sec < 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      onPointerDown={handleUserActivity}
      onClick={togglePlay}
      className={`group relative overflow-hidden bg-black select-none cursor-pointer w-full h-full flex items-center justify-center ${className}`}
    >
      {/* Balise vidéo responsive - object-contain garantit zéro coupure */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted={true}
        loop={loop}
        autoPlay={autoPlay}
        className="w-full h-full object-contain object-center"
      />

      {/* Indicateur Play/Pause central discret */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-200 pointer-events-none ${
          !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xl">
          <Play className="w-6 h-6 text-champagne fill-champagne ml-0.5" />
        </div>
      </div>

      {/* Bouton Son Permanent Flottant (toujours visible à l'écran, sans collision avec le bouton Fermer) */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute top-3 right-14 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/85 backdrop-blur-md text-white hover:text-champagne flex items-center justify-center border border-white/25 shadow-xl transition-transform active:scale-95 pointer-events-auto"
        aria-label={isMuted ? "Activer le son" : "Couper le son"}
        title={isMuted ? "Activer le son" : "Couper le son"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white/90" />
        ) : (
          <Volume2 className="w-4 h-4 text-champagne" />
        )}
      </button>

      {/* Bouton d'indication son lorsqu'elle démarre en muet */}
      {isMuted && isPlaying && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-30 cursor-pointer bg-black/85 hover:bg-black text-creme text-xs font-semibold px-4 py-2 rounded-full border border-champagne/60 shadow-2xl flex items-center space-x-2 transition-all active:scale-95 pointer-events-auto"
        >
          <VolumeX className="w-4 h-4 text-champagne shrink-0" />
          <span>Toucher pour le son</span>
        </button>
      )}

      {/* En-tête minimaliste : Titre discret à gauche */}
      <div className="absolute top-3 left-3 right-28 flex items-center justify-between z-20 pointer-events-none">
        {title ? (
          <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 line-clamp-1 max-w-[85%] pointer-events-auto">
            {title}
          </span>
        ) : (
          <div />
        )}
      </div>

      {/* Barre de contrôle basse : toujours 100% visible, parfaitement lisible sur mobile & desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-30 pointer-events-auto"
      >
        {/* Scrubber dynamique sans lag CSS : supporte clic instantané et glisser au doigt ou à la souris */}
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative py-2 w-full cursor-pointer touch-none group/bar flex items-center"
        >
          <div className="relative h-1.5 w-full bg-white/30 rounded-full overflow-visible transition-[height] duration-150">
            {/* Remplissage instantané (pas de transition-all pour un suivi 100% direct) */}
            <div
              className="h-full bg-champagne rounded-full relative"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            >
              {/* Curseur de suivi */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-champagne shadow-md transition-transform duration-100 ${
                  isScrubbing ? "scale-125" : "scale-100"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Contrôles bas : Play/Pause, Son/Volume, Minuteur & Plein écran */}
        <div className="flex items-center justify-between text-xs text-stone-200 pt-1">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-95 border border-white/20"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              )}
            </button>

            {/* Bouton Son ergonomique, haute visibilité permanent */}
            <button
              type="button"
              onClick={toggleMute}
              className={`px-2.5 py-1.5 flex items-center space-x-1.5 rounded-xl border transition-all active:scale-95 shadow-sm ${
                isMuted
                  ? "text-white bg-white/20 hover:bg-white/30 border-white/30"
                  : "text-champagne bg-champagne/25 hover:bg-champagne/35 border-champagne/60 font-semibold"
              }`}
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-champagne" />
              )}
              <span className="text-[11px] font-semibold tracking-wide">
                {isMuted ? "Son coupé" : "Son actif"}
              </span>
            </button>

            <span className="font-mono text-[11px] text-white/85 font-medium pl-0.5">
              {formatSeconds(currentTime)} / {formatSeconds(duration || 0)}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
            aria-label="Plein écran"
            title="Plein écran"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
