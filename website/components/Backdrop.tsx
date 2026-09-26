"use client";
import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

// A mock YouTube watch page. uNoise is the glitch amount: 1 while the intro
// holds, falling to 0 as the page "strips the noise"; the pointer brings it
// back locally so the effect stays alive.
const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform float uNoise;
uniform float uExpo;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec2 uPar;

float hash(vec2 s){ return fract(sin(dot(s, vec2(12.9898,78.233))) * 43758.5453); }

vec3 split(vec2 st, float a){
  return vec3(
    texture2D(tex, st + vec2(a, 0.0)).r,
    texture2D(tex, st).g,
    texture2D(tex, st - vec2(a, 0.0)).b
  );
}

void main(){
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 st = vec2(uv.x, 1.0 - uv.y);
  st += (uPar - 0.5) * vec2(-0.01, 0.007);

  float near = 1.0 - smoothstep(0.0, 0.36, length((uv - uMouse) * aspect));
  float m = max(uNoise, near * 0.55);

  float band = floor(st.y * 26.0);
  float tick = floor(uTime * 12.0);
  st.x += (hash(vec2(band, tick)) - 0.5) * step(0.76, hash(vec2(band, tick * 0.37))) * 0.16 * m;
  st.y += (hash(vec2(tick, 3.0)) - 0.5) * step(0.9, hash(vec2(tick, 9.0))) * 0.02 * m;
  st += vec2(sin(uTime * 0.11), cos(uTime * 0.09)) * 0.003;

  vec3 col = split(st, 0.05 * m);
  col.r += 0.08 * m;
  col += (hash(st * uRes + uTime) - 0.5) * (0.03 + 0.14 * m);
  col *= 0.8 - 0.25 * m;

  vec2 v = uv - vec2(0.55, 0.45);
  col *= 1.0 - dot(v, v) * 0.9;

  col *= uExpo;
  gl_FragColor = vec4(col, 1.0);
}
`;

function roundRect(
  x: CanvasRenderingContext2D,
  a: number,
  b: number,
  w: number,
  h: number,
  r: number,
) {
  x.beginPath();
  x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r);
  x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r);
  x.arcTo(a, b, a + w, b, r);
  x.closePath();
}

// Drawn in 1440-wide design units scaled to the viewport width, so the layout
// reads as a real watch page. Portrait viewports scale the page up and tuck it
// into the lower half, under the actions. The left column stays quiet on
// purpose: it sits under the headline and only needs to read as structure.
function drawWatchPage(c: HTMLCanvasElement, w: number, h: number) {
  const x = c.getContext("2d");
  if (!x) return;
  c.width = w;
  c.height = h;
  const portrait = w < h;
  const s = portrait ? (w < h * 0.6 ? w / 900 : (w * 1.25) / 1440) : w / 1440;
  const oy = portrait ? h - 900 * s - 40 * s : 0;
  x.setTransform(s, 0, 0, s, 0, oy);
  x.fillStyle = "#0b0b0c";
  x.fillRect(0, -oy / s, w / s, h / s);

  x.strokeStyle = "rgba(120,120,130,0.22)";
  x.lineWidth = 1;
  roundRect(x, 470, 30, 420, 34, 17);
  x.stroke();
  x.fillStyle = "rgba(120,120,130,0.2)";
  x.beginPath();
  x.arc(1330, 47, 17, 0, 7);
  x.fill();

  const frame = { x: 70, y: 96, w: 850, h: 478 };
  const lit = x.createRadialGradient(
    frame.x + frame.w * 0.5,
    frame.y + frame.h * 0.5,
    20,
    frame.x + frame.w * 0.5,
    frame.y + frame.h * 0.5,
    frame.w * 0.62,
  );
  lit.addColorStop(0, "#202024");
  lit.addColorStop(1, "#121215");
  x.fillStyle = lit;
  roundRect(x, frame.x, frame.y, frame.w, frame.h, 10);
  x.fill();

  x.fillStyle = "rgba(234,229,216,0.08)";
  x.beginPath();
  x.moveTo(frame.x + frame.w * 0.5 - 20, frame.y + frame.h * 0.5 - 28);
  x.lineTo(frame.x + frame.w * 0.5 + 32, frame.y + frame.h * 0.5);
  x.lineTo(frame.x + frame.w * 0.5 - 20, frame.y + frame.h * 0.5 + 28);
  x.closePath();
  x.fill();

  x.fillStyle = "rgba(234,229,216,0.16)";
  x.fillRect(frame.x + 16, frame.y + frame.h - 10, frame.w - 32, 3);
  x.fillStyle = "#ff3322";
  x.fillRect(frame.x + 16, frame.y + frame.h - 10, (frame.w - 32) * 0.34, 3);
  x.fillStyle = "#ffcc00";
  x.fillRect(frame.x + 16 + (frame.w - 32) * 0.61, frame.y + frame.h - 10, 8, 3);
  x.fillStyle = "rgba(234,229,216,0.5)";
  x.fillRect(frame.x + 16 + (frame.w - 32) * 0.34 - 12, frame.y + frame.h - 36, 12, 12);
  x.fillRect(frame.x + 54, frame.y + frame.h - 36, 12, 12);
  x.fillRect(frame.x + 84, frame.y + frame.h - 36, 12, 12);

  x.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(x, 780, 520, 124, 40, 4);
  x.fill();
  x.fillStyle = "rgba(255,255,255,0.6)";
  x.font = "500 15px system-ui, sans-serif";
  x.fillText("Skip ad", 798, 546);
  x.beginPath();
  x.moveTo(872, 532);
  x.lineTo(886, 540);
  x.lineTo(872, 548);
  x.closePath();
  x.fill();

  x.fillStyle = "rgba(150,150,160,0.4)";
  x.fillRect(70, 600, 560, 22);
  x.fillStyle = "rgba(70,70,80,0.5)";
  x.beginPath();
  x.arc(90, 656, 20, 0, 7);
  x.fill();
  x.fillStyle = "rgba(90,90,100,0.6)";
  x.fillRect(122, 645, 180, 12);
  x.fillStyle = "rgba(60,60,70,0.4)";
  x.fillRect(122, 664, 120, 9);
  x.fillStyle = "rgba(234,229,216,0.3)";
  roundRect(x, 330, 638, 118, 36, 18);
  x.fill();
  for (let i = 0; i < 4; i++) {
    x.fillStyle = "rgba(70,70,80,0.3)";
    roundRect(x, 480 + i * 114, 638, 100, 36, 18);
    x.fill();
  }

  x.fillStyle = "rgba(60,60,70,0.28)";
  roundRect(x, 70, 700, 850, 78, 8);
  x.fill();
  x.fillStyle = "rgba(120,120,130,0.55)";
  x.fillRect(86, 716, 240, 11);
  x.fillStyle = "rgba(90,90,100,0.4)";
  x.fillRect(86, 738, 620, 9);
  x.fillRect(86, 756, 460, 9);

  for (let i = 0; i < 3; i++) {
    const y = 806 + i * 56;
    x.fillStyle = "rgba(70,70,80,0.5)";
    x.beginPath();
    x.arc(86, y + 16, 16, 0, 7);
    x.fill();
    x.fillStyle = "rgba(90,90,100,0.55)";
    x.fillRect(120, y, 280, 12);
    x.fillStyle = "rgba(60,60,70,0.35)";
    x.fillRect(120, y + 22, 480, 10);
  }

  // Badge at the top and lines short-to-long is not how YouTube lays a card
  // out; it is the arrangement that was signed off on and must stay as is.
  for (let i = 0; i < 6; i++) {
    const y = 96 + i * 122;
    x.fillStyle = "rgba(45,45,52,0.7)";
    x.fillRect(960, y, 168, 94);
    x.fillStyle = "rgba(255,51,34,0.85)";
    x.fillRect(1098, y + 8, 30, 16);
    x.fillStyle = "rgba(80,80,90,0.4)";
    x.fillRect(1140, y + 38, 110, 10);
    x.fillStyle = "rgba(80,80,90,0.5)";
    x.fillRect(1140, y + 56, 150, 10);
    x.fillStyle = "rgba(120,120,130,0.65)";
    x.fillRect(1140, y + 76, 210, 12);
  }
}

// Intro envelope, in seconds: the plate holds fully glitched while the headline
// starts to rise, collapses as the second line lands, stutters once, then goes
// clean. The CSS reveal delays in page.tsx are timed against these numbers.
function noiseAt(t: number) {
  if (t < 0.7) return 1;
  if (t < 1.02) return 1 - 0.75 * ((t - 0.7) / 0.32);
  if (t < 1.12) return 0.25 + 0.45 * (1 - (t - 1.02) / 0.1);
  if (t < 1.55) {
    const k = 1 - (t - 1.12) / 0.43;
    return 0.25 * k * k * k;
  }
  return 0;
}

export default function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uNoise = u("uNoise");
    const uExpo = u("uExpo");
    const uTime = u("uTime");
    const uRes = u("uRes");
    const uMouse = u("uMouse");
    const uPar = u("uPar");

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const page = document.createElement("canvas");
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      drawWatchPage(page, w, h);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, page);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: -2, y: -2, tx: -2, ty: -2 };
    const par = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = par.tx = e.clientX / window.innerWidth;
      mouse.ty = par.ty = 1 - e.clientY / window.innerHeight;
    };
    const onLeave = () => {
      mouse.tx = mouse.ty = -2;
      par.tx = par.ty = 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      const noise = reduceMotion ? 0 : noiseAt(t);
      const expo = reduceMotion ? 1 : Math.min(1, t / 0.9);
      mouse.x += (mouse.tx - mouse.x) * 0.1;
      mouse.y += (mouse.ty - mouse.y) * 0.1;
      par.x += (par.tx - par.x) * 0.035;
      par.y += (par.ty - par.y) * 0.035;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uNoise, noise);
      gl.uniform1f(uExpo, 1 - (1 - expo) * (1 - expo));
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uPar, par.x, par.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibility);
    frame();

    // The context is deliberately not released here: React dev mode re-runs
    // effects, and a released context stays lost on the same canvas.
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="backdrop" aria-hidden />;
}
