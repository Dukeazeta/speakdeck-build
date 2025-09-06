import React, { useRef, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon 
} from '@heroicons/react/24/outline';
import { usePresentationSelectors } from '../../stores/presentation-store';

interface PresentationViewerProps {
  className?: string;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({ 
  className = '' 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const {
    currentSlide,
    currentSlideNumber,
    totalSlides,
    canGoNext,
    canGoPrevious,
    isPlaying,
    volume,
    hasAudio,
    audioUrl,
    nextSlide,
    previousSlide,
    togglePlayback,
    setVolume,
    setIsPlaying,
  } = usePresentationSelectors();

  // Audio playback effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      if (isPlaying && audioUrl) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl, volume, setIsPlaying]);

  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      // Only auto-advance if audio is longer than 5 seconds (real narration)
      // This prevents auto-advance for silent/fallback audio
      console.log(`Audio ended. Duration: ${audio.duration}s, Will auto-advance: ${canGoNext && audio.duration > 5}`);
      if (canGoNext && audio.duration > 5) {
        setTimeout(() => nextSlide(), 1000);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [canGoNext, nextSlide, setIsPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (canGoPrevious) previousSlide();
          break;
        case 'ArrowRight':
          if (canGoNext) nextSlide();
          break;
        case ' ':
          event.preventDefault();
          if (hasAudio) togglePlayback();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoPrevious, hasAudio, nextSlide, previousSlide, togglePlayback]);

  if (!currentSlide) {
    return (
      <div className={`flex items-center justify-center min-h-96 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
            </svg>
          </div>
          <p className="text-gray-500">No presentation loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Slide Content */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Slide Image */}
        {currentSlide.imageUrl && (
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title || 'Presentation slide'}
            className="w-full h-full object-cover"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'cover'
            }}
            loading="lazy"
            onLoad={(e) => {
              console.log('Image loaded successfully:', currentSlide.imageUrl?.substring(0, 50) + '...');
            }}
            onError={(e) => {
              console.warn('Failed to load image:', currentSlide.imageUrl);
              // Fallback for broken images
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        
        {/* Slide Text Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            {currentSlide.title}
          </h2>
          <p className="text-lg text-white/90 leading-relaxed drop-shadow">
            {currentSlide.content}
          </p>
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentSlideNumber} / {totalSlides}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-white border-t">
        <div className="flex items-center justify-between">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={previousSlide}
              disabled={!canGoPrevious}
              className={`p-2 rounded-full transition-colors ${
                canGoPrevious
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Previous slide"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              disabled={!canGoNext}
              className={`p-2 rounded-full transition-colors ${
                canGoNext
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Next slide"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center space-x-4">
            {hasAudio && (
              <>
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayback}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPlaying
                      ? 'bg-red-100 hover:bg-red-200 text-red-600'
                      : 'bg-green-100 hover:bg-green-200 text-green-600'
                  }`}
                  title={isPlaying ? 'Pause narration' : 'Play narration'}
                >
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {isPlaying ? 'Pause' : 'Play'} Narration
                  </span>
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title={volume === 0 ? 'Unmute' : 'Mute'}
                  >
                    {volume === 0 ? (
                      <SpeakerXMarkIcon className="w-5 h-5" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    title="Volume"
                  />
                </div>
              </>
            )}

            {!hasAudio && (
              <div className="text-sm text-gray-500 italic">
                No audio available
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round((currentSlideNumber / totalSlides) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSlideNumber / totalSlides) * 100}%` }}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Use ← → arrow keys to navigate • Press spacebar to play/pause audio
        </div>
      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onError={() => {
            console.warn('Failed to load audio:', audioUrl);
            setIsPlaying(false);
          }}
        />
      )}
    </div>
  );
};
