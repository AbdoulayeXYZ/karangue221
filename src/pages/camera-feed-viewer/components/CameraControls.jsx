import React from 'react';
import Icon from 'components/AppIcon';

const CameraControls = ({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  isFullscreen,
  isPictureInPicture,
  onPlayPause,
  onTimelineSeek,
  onSpeedChange,
  onFullscreen,
  onPictureInPicture,
  onExport
}) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineChange = (e) => {
    const newTime = parseInt(e.target.value);
    onTimelineSeek(newTime);
  };

  const speedOptions = [0.25, 0.5, 1, 1.5, 2];

  return (
    <div className="bg-surface-secondary rounded-base p-4">
      {/* Timeline Scrubber */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-data text-text-secondary min-w-16">
            {formatTime(currentTime)}
          </span>
          
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleTimelineChange}
              className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${(currentTime / duration) * 100}%, var(--color-border) ${(currentTime / duration) * 100}%, var(--color-border) 100%)`
              }}
            />
          </div>
          
          <span className="text-sm font-data text-text-secondary min-w-16">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 bg-secondary text-white rounded-full hover:bg-secondary-700 transition-colors duration-150"
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={18} />
          </button>

          {/* Skip Backward */}
          <button
            onClick={() => onTimelineSeek(Math.max(0, currentTime - 10))}
            className="flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text-primary transition-colors duration-150"
            aria-label="Reculer de 10 secondes"
          >
            <Icon name="SkipBack" size={16} />
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => onTimelineSeek(Math.min(duration, currentTime + 10))}
            className="flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text-primary transition-colors duration-150"
            aria-label="Avancer de 10 secondes"
          >
            <Icon name="SkipForward" size={16} />
          </button>

          {/* Speed Control */}
          <div className="flex items-center space-x-2 ml-4">
            <Icon name="Gauge" size={14} className="text-text-secondary" />
            <select
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="text-sm bg-surface border border-border rounded px-2 py-1 text-text-primary"
            >
              {speedOptions.map(speed => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Picture in Picture */}
          <button
            onClick={onPictureInPicture}
            className={`flex items-center justify-center w-8 h-8 transition-colors duration-150 ${
              isPictureInPicture 
                ? 'text-secondary' :'text-text-secondary hover:text-text-primary'
            }`}
            aria-label="Picture-in-Picture"
          >
            <Icon name="PictureInPicture2" size={16} />
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center space-x-1 px-3 py-1.5 bg-accent text-white rounded-base hover:bg-accent-600 transition-colors duration-150 text-sm"
          >
            <Icon name="Download" size={14} />
            <span>Exporter</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={onFullscreen}
            className={`flex items-center justify-center w-8 h-8 transition-colors duration-150 ${
              isFullscreen 
                ? 'text-secondary' :'text-text-secondary hover:text-text-primary'
            }`}
            aria-label="Plein écran"
          >
            <Icon name={isFullscreen ? 'Minimize' : 'Maximize'} size={16} />
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-text-secondary">
        <div className="flex items-center space-x-4">
          <span>Qualité: HD 1080p</span>
          <span>•</span>
          <span>FPS: 30</span>
          <span>•</span>
          <span>Codec: H.264</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="Wifi" size={12} className="text-success" />
          <span>Signal: Excellent</span>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;