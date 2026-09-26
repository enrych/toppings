"use client";
import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

// A mock YouTube watch page. uNoise is 1 on load and eases to 0 as the page
// "strips the noise"; the pointer brings it back locally so the effect stays alive.
const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform float uNoise;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;

float hash(vec2 s){ return fract(sin(dot(s, vec2(12.9898,78.233))) * 43758.5453); }

vec3 split(vec2 st, float a){
  return vec3(
    texture2D(tex, st + vec2(a, 0.0)).r,
    texture2D(tex, st).g,
    texture2D(tex, st - vec2(a, 0.0)).b
  );
}

void main(){
  vec2 st = vec2(uv.x, 1.0 - uv.y);
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  float near = 1.0 - smoothstep(0.0, 0.38, length((uv - uMouse) * aspect));
  float m = max(uNoise, near * 0.55);

  float band = floor(st.y * 26.0);
  st.x += (hash(vec2(band, floor(uTime * 10.0))) - 0.5)
          * step(0.78, hash(vec2(band, 7.0))) * 0.16 * m;
  st += vec2(sin(uTime * 0.11), cos(uTime * 0.09)) * 0.004;

  vec3 col = split(st, 0.002 + 0.05 * m);
  col.r += 0.08 * m;
  col += (hash(st * uRes + uTime) - 0.5) * 0.14 * m;
  col *= 0.8 - 0.25 * m;

  vec2 v = uv - vec2(0.55, 0.45);
  col *= 1.0 - dot(v, v) * 0.9;
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

function drawWatchPage(c: HTMLCanvasElement, w: number, h: number) {
  const x = c.getContext("2d");
  if (!x) return;
  c.width = w;
  c.height = h;
  const s = w / 1440;
  x.fillStyle = "#0b0b0c";
  x.fillRect(0, 0, w, h);

  x.fillStyle = "#ff3322";
  roundRect(x, 70 * s, 30 * s, 46 * s, 32 * s, 7 * s);
  x.fill();
  x.strokeStyle = "rgba(120,120,130,0.5)";
  x.lineWidth = s;
  roundRect(x, 470 * s, 30 * s, 420 * s, 34 * s, 17 * s);
  x.stroke();
  x.fillStyle = "rgba(120,120,130,0.45)";
  x.beginPath();
  x.arc(1330 * s, 47 * s, 17 * s, 0, 7);
  x.fill();

  x.fillStyle = "#161619";
  x.fillRect(70 * s, 96 * s, 850 * s, 478 * s);
  x.fillStyle = "#ffcc00";
  x.fillRect(70 * s, 540 * s, 30 * s, 18 * s);
  x.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(x, 780 * s, 520 * s, 124 * s, 40 * s, 4 * s);
  x.fill();
  x.fillStyle = "#fff";
  x.font = `${15 * s}px monospace`;
  x.fillText("SKIP AD ▷", 798 * s, 545 * s);

  x.fillStyle = "rgba(150,150,160,0.85)";
  x.fillRect(70 * s, 600 * s, 560 * s, 22 * s);
  x.fillStyle = "rgba(90,90,100,0.6)";
  x.fillRect(70 * s, 634 * s, 320 * s, 14 * s);
  for (let i = 0; i < 5; i++) {
    x.fillStyle = "rgba(70,70,80,0.5)";
    roundRect(x, (70 + i * 120) * s, 672 * s, 104 * s, 36 * s, 18 * s);
    x.fill();
  }
  for (let i = 0; i < 3; i++) {
    const y = (740 + i * 56) * s;
    x.fillStyle = "rgba(70,70,80,0.5)";
    x.beginPath();
    x.arc(86 * s, y + 16 * s, 16 * s, 0, 7);
    x.fill();
    x.fillStyle = "rgba(90,90,100,0.55)";
    x.fillRect(120 * s, y, 280 * s, 12 * s);
    x.fillStyle = "rgba(60,60,70,0.35)";
    x.fillRect(120 * s, y + 22 * s, 480 * s, 10 * s);
  }
  for (let i = 0; i < 6; i++) {
    const y = (96 + i * 122) * s;
    x.fillStyle = "rgba(45,45,52,0.7)";
    x.fillRect(960 * s, y, 168 * s, 94 * s);
    x.fillStyle = "rgba(255,51,34,0.85)";
    x.fillRect(1098 * s, y + 70 * s, 30 * s, 16 * s);
    x.fillStyle = "rgba(120,120,130,0.65)";
    x.fillRect(1140 * s, y + 6 * s, 210 * s, 12 * s);
    x.fillStyle = "rgba(80,80,90,0.5)";
    x.fillRect(1140 * s, y + 28 * s, 150 * s, 10 * s);
    x.fillStyle = "rgba(80,80,90,0.4)";
    x.fillRect(1140 * s, y + 46 * s, 110 * s, 10 * s);
  }
}

const INTRO_MS = 2400;

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

    const uNoise = gl.getUniformLocation(program, "uNoise");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uRes = gl.getUniformLocation(program, "uRes");
    const uMouse = gl.getUniformLocation(program, "uMouse");

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

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
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      const intro = Math.min(1, (t * 1000) / INTRO_MS);
      const noise = reduceMotion || intro >= 1 ? 0 : Math.pow(2, -10 * intro);
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uNoise, noise);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    };
    frame();

    // The context is deliberately not released here: React dev mode re-runs
    // effects, and a released context stays lost on the same canvas.
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="backdrop" aria-hidden />;
}
