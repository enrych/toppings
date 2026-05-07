import React from "dom-chef";

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let animationFrameId: number | null = null;
let connectedVideo: HTMLVideoElement | null = null;

const SMOOTHING = 0.82;
const FFT_SIZE = 512;

export const AudioModeCanvas = (
  <canvas
    id="tppng-audio-visualizer-canvas"
    className="tw-w-full tw-h-full tw-absolute tw-inset-0"
  />
) as unknown as HTMLCanvasElement;

/**
 * Ensures the video's audio is routed through the AudioContext to the
 * destination (speakers). Once createMediaElementSource is called, the video
 * no longer outputs audio directly — it must go through the graph. We keep
 * `source -> destination` connected at all times so audio plays in every
 * screen mode, and only attach/detach the analyser side-branch.
 */
export function ensureAudioRouting(video: HTMLVideoElement) {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    if (connectedVideo !== video) {
      if (source) {
        try {
          source.disconnect();
        } catch (_e) {}
      }
      source = audioContext.createMediaElementSource(video);
      source.connect(audioContext.destination);
      connectedVideo = video;
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  } catch (_e) {
    // If we can't create the source (e.g. it was created elsewhere), the
    // video keeps its native audio output and the visualizer falls back.
  }
}

export function startVisualizer(video: HTMLVideoElement) {
  try {
    ensureAudioRouting(video);

    if (!audioContext || !source) {
      renderFallbackWave();
      return;
    }

    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;
    }

    source.connect(analyser);

    renderWaveform();
  } catch (_e) {
    renderFallbackWave();
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

function renderWaveform() {
  if (!analyser) return;

  const canvas = AudioModeCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const freqLength = analyser.frequencyBinCount;
  const freqData = new Uint8Array(freqLength);
  const timeData = new Uint8Array(analyser.fftSize);

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    analyser!.getByteFrequencyData(freqData);
    analyser!.getByteTimeDomainData(timeData);

    let avgFreq = 0;
    for (let i = 0; i < freqLength; i++) {
      avgFreq += freqData[i];
    }
    avgFreq = avgFreq / freqLength / 255;

    const amplitude = Math.max(0.02, avgFreq) * h * 0.4;

    const points: { x: number; y: number }[] = [];
    const totalPoints = 200;

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const x = t * w;

      const timeIndex = Math.floor(t * (timeData.length - 1));
      const timeSample = (timeData[timeIndex] - 128) / 128;

      const envelope =
        Math.sin(t * Math.PI) *
        Math.sin(t * Math.PI) *
        (0.6 + 0.4 * Math.sin(t * Math.PI * 2));

      const freqIndex = Math.floor(t * (freqLength - 1));
      const freqInfluence = freqData[freqIndex] / 255;

      const y =
        centerY +
        timeSample * amplitude * envelope +
        Math.sin(t * Math.PI * 8 + avgFreq * 20) *
          amplitude *
          0.3 *
          envelope *
          freqInfluence;

      points.push({ x, y });
    }

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const cpx = (points[i].x + points[i + 1].x) / 2;
      const cpy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.lineTo(w, centerY);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5 * dpr;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
  };

  draw();
}

function renderFallbackWave() {
  const canvas = AudioModeCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let phase = 0;

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    phase += 0.015;

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let x = 0; x <= w; x += 2) {
      const t = x / w;
      const envelope = Math.sin(t * Math.PI) * Math.sin(t * Math.PI);
      const amplitude = h * 0.15 * envelope;
      const y =
        centerY +
        Math.sin(t * Math.PI * 8 + phase) * amplitude +
        Math.sin(t * Math.PI * 3 + phase * 0.7) * amplitude * 0.4;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2 * dpr;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
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
