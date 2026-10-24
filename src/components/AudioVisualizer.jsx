import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ audioRef, isPlaying, visualizerMode = 'bars' }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const isWebAudioConnected = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Connect Web Audio API when user first interacts/plays
    const initWebAudio = () => {
      if (isWebAudioConnected.current) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        if (!analyserRef.current) {
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;

          try {
            // Can only create MediaElementSource once per audio element
            if (!sourceRef.current) {
              sourceRef.current = ctx.createMediaElementSource(audio);
              sourceRef.current.connect(analyser);
              analyser.connect(ctx.destination);
              isWebAudioConnected.current = true;
            }
          } catch (e) {
            // MediaElementSource already connected or cross-origin restriction
            console.warn('Web Audio node connection fallback:', e);
          }
        }
      } catch (err) {
        console.warn('AudioContext initialization error:', err);
      }
    };

    if (isPlaying) {
      initWebAudio();
    }
  }, [isPlaying, audioRef]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let dataArray = null;
      let bufferLength = 32;

      if (analyserRef.current && isWebAudioConnected.current && isPlaying) {
        bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      // Check if real frequency data is non-zero
      let hasRealData = false;
      if (dataArray) {
        for (let i = 0; i < bufferLength; i++) {
          if (dataArray[i] > 10) {
            hasRealData = true;
            break;
          }
        }
      }

      const barCount = 36;
      const barWidth = (width / barCount) - 3;

      for (let i = 0; i < barCount; i++) {
        let value = 0;

        if (isPlaying) {
          if (hasRealData && dataArray) {
            const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
            value = (dataArray[dataIndex] / 255);
          } else {
            // Fallback fluid simulation
            phase += 0.001;
            const wave1 = Math.sin(phase * 4 + i * 0.25);
            const wave2 = Math.cos(phase * 6 + i * 0.15);
            value = Math.max(0.12, (wave1 + wave2 + 2) / 4);
          }
        } else {
          // Idle state
          value = 0.06;
        }

        const barHeight = Math.max(4, value * (height * 0.85));
        const x = i * (barWidth + 3);
        const y = height - barHeight;

        // Gradient for each bar
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#7c3aed');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#38bdf8');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barHeight);
        ctx.fill();

        // Top glow cap
        if (isPlaying && value > 0.3) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 px-1">
      <canvas
        ref={canvasRef}
        width={360}
        height={64}
        className="w-full max-w-sm h-14 rounded-lg opacity-90 transition-opacity duration-300"
      />
    </div>
  );
}
