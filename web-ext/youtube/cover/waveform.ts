import { analyserFor } from "./audioTap";

const POINTS = 200;

// Draws on the canvas until the returned stop is called: the waveform of what
// the media plays, or an idle wave while its audio cannot be read yet.
export function drawWaveform(canvas: HTMLCanvasElement, media: HTMLMediaElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let frame = 0;
  let phase = 0;
  let freq = new Uint8Array(0);
  let time = new Uint8Array(0);

  const draw = () => {
    frame = requestAnimationFrame(draw);
    const dpr = devicePixelRatio || 1;
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const centerY = h / 2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const analyser = analyserFor(media);
    if (analyser) {
      if (freq.length !== analyser.frequencyBinCount) freq = new Uint8Array(analyser.frequencyBinCount);
      if (time.length !== analyser.fftSize) time = new Uint8Array(analyser.fftSize);
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(time);
      strokeLive(ctx, w, h, centerY, dpr, freq, time);
    } else {
      phase += 0.015;
      strokeIdle(ctx, w, h, centerY, dpr, phase);
    }

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = dpr;
    ctx.stroke();
  };
  draw();
  return () => cancelAnimationFrame(frame);
}

function strokeLive(ctx: CanvasRenderingContext2D, w: number, h: number, centerY: number, dpr: number, freq: Uint8Array, time: Uint8Array): void {
  // Peak loudness over the lower spectrum, where most music's energy is,
  // rather than the average over every bin, which the quiet high bins
  // dilute; the square root keeps quiet passages visible.
  const lowBins = Math.floor(freq.length * 0.6);
  let peak = 0;
  let sum = 0;
  for (let i = 0; i < lowBins; i++) {
    peak = Math.max(peak, freq[i]);
    sum += freq[i];
  }
  const loudness = Math.sqrt((peak / 255) * 0.7 + (sum / lowBins / 255) * 0.3);
  const amplitude = Math.max(0.05, loudness) * h * 0.45;

  ctx.beginPath();
  ctx.moveTo(0, centerY);
  let previous = { x: 0, y: centerY };
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const sample = (time[Math.floor(t * (time.length - 1))] - 128) / 128;
    const envelope = Math.sin(t * Math.PI) ** 2 * (0.6 + 0.4 * Math.sin(t * Math.PI * 2));
    const band = freq[Math.floor(t * (freq.length - 1))] / 255;
    const point = {
      x: t * w,
      y: centerY + sample * amplitude * envelope + Math.sin(t * Math.PI * 8 + loudness * 20) * amplitude * 0.35 * envelope * band,
    };
    ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) / 2, (previous.y + point.y) / 2);
    previous = point;
  }
  ctx.lineTo(w, centerY);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.5 * dpr;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function strokeIdle(ctx: CanvasRenderingContext2D, w: number, h: number, centerY: number, dpr: number, phase: number): void {
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  for (let x = 0; x <= w; x += 2) {
    const t = x / w;
    const amplitude = h * 0.15 * Math.sin(t * Math.PI) ** 2;
    ctx.lineTo(x, centerY + Math.sin(t * Math.PI * 8 + phase) * amplitude + Math.sin(t * Math.PI * 3 + phase * 0.7) * amplitude * 0.4);
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2 * dpr;
  ctx.lineJoin = "round";
  ctx.stroke();
}
