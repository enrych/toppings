import React from "dom-chef";

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let animationFrameId: number | null = null;
let connectedVideo: HTMLVideoElement | null = null;

export const AudioModeCanvas = (
  <canvas
    id="tppng-audio-visualizer-canvas"
    className="tw-w-full tw-h-full tw-absolute tw-inset-0"
  />
) as unknown as HTMLCanvasElement;

export function startVisualizer(video: HTMLVideoElement) {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    if (connectedVideo !== video) {
      if (source) {
        source.disconnect();
      }
      source = audioContext.createMediaElementSource(video);
      connectedVideo = video;
    }

    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
    }

    source!.connect(analyser);
    analyser.connect(audioContext.destination);

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    renderFrame();
  } catch (_e) {
    renderFallbackPulse();
  }
}

export function stopVisualizer() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (analyser && source) {
    try {
      source.disconnect(analyser);
    } catch (_e) {}
  }
}

function renderFrame() {
  if (!analyser) return;

  const canvas = AudioModeCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);

    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);

    analyser!.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

      const hue = (i / bufferLength) * 120 + 200;
      ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  draw();
}

function renderFallbackPulse() {
  const canvas = AudioModeCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let phase = 0;

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);

    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    phase += 0.02;
    const radius =
      Math.min(canvas.width, canvas.height) * 0.15 * (1 + Math.sin(phase) * 0.3);

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 150, 255, ${0.3 + Math.sin(phase) * 0.2})`;
    ctx.fill();
  };

  draw();
}

export function destroyVisualizer() {
  stopVisualizer();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    analyser = null;
    source = null;
    connectedVideo = null;
  }
}
