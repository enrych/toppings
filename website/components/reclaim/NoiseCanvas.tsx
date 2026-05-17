"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface NoiseHandle {
  /** 0 = full hostile noise, 1 = stripped clean. */
  setProgress: (p: number) => void;
}

export type HeroVariant = "signal" | "pressure" | "jammed";
const VARIANT_INDEX: Record<HeroVariant, number> = {
  signal: 0,
  pressure: 1,
  jammed: 2,
};

/**
 * The reclaim shader. A recognisable YouTube watch page is drawn to an
 * offscreen 2D canvas (red logo, ad, recommendation rail, comments — so
 * it can never read as "a broken monitor"); the fragment shader then
 * expresses *YouTube's* hostility in one of three ways, all gated by
 * the noise amount n = 1 - progress so the Break still resolves clean:
 *
 *   • signal   — the video you came for stays crisp in the centre;
 *                everything around it (ads, rail, comments) churns.
 *   • pressure — the whole UI breathes/distorts in a rhythmic
 *                attention-grab pulse.
 *   • jammed   — a broadcast-jam: rolling tears + dropouts fight the
 *                content you actually want.
 */
const VERT = `
attribute vec2 p;
varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform float uN;
uniform float uTime;
uniform float uVar;
uniform vec2 uRes;
uniform vec2 uMouse;

float hash(vec2 s){ return fract(sin(dot(s, vec2(12.9898,78.233))) * 43758.5453); }

vec3 sample(vec2 st, float a){
  return vec3(
    texture2D(tex, st + vec2(a, 0.0)).r,
    texture2D(tex, st).g,
    texture2D(tex, st - vec2(a, 0.0)).b
  );
}

void main(){
  vec2 st = vec2(uv.x, 1.0 - uv.y);
  st += uMouse * 0.012 * uN;
  float amt = uN;
  vec3 col;

  if (uVar < 0.5) {
    // ---- signal vs noise: crisp centre, churning periphery ----
    vec2 d = (uv - vec2(0.46, 0.46)) / vec2(0.40, 0.36);
    float edge = smoothstep(0.6, 1.25, length(d)); // 0 centre → 1 edge
    float m = amt * edge;
    float band = floor(st.y * 26.0);
    st.x += (hash(vec2(band, floor(uTime*10.0))) - 0.5)
            * step(0.78, hash(vec2(band, 7.0))) * 0.16 * m;
    col = sample(st, (0.012 + 0.05 * m) * m);
    col.r += 0.08 * m;
    col += (hash(st * uRes + uTime) - 0.5) * 0.14 * m;
    // Sit behind the foreground: darken, and darken more where noisy.
    col *= 0.52 - 0.16 * m;
  } else if (uVar < 1.5) {
    // ---- pressure: rhythmic whole-frame attention grab ----
    float pulse = 0.55 + 0.45 * sin(uTime * 3.0);
    float m = amt * (0.45 + 0.55 * pulse);
    st = (st - 0.5) * (1.0 + 0.012 * pulse * amt) + 0.5;
    float band = floor(st.y * 22.0);
    st.x += (hash(vec2(band, floor(uTime*8.0))) - 0.5)
            * step(0.82, hash(vec2(band, 3.0))) * 0.14 * m;
    col = sample(st, (0.016 + 0.06 * pulse) * m);
    col.r += 0.16 * m;
    col += (hash(st * uRes + uTime) - 0.5) * 0.15 * m;
  } else {
    // ---- jammed: broadcast interference fighting the content ----
    float roll = fract(st.y - uTime * 0.12);
    float tear = smoothstep(0.0, 0.04, roll) * (1.0 - smoothstep(0.05, 0.12, roll));
    st.x += tear * 0.20 * amt;
    float line = floor(st.y * uRes.y * 0.5);
    float drop = step(0.93, hash(vec2(line, floor(uTime*20.0)))) * amt;
    col = sample(st, (0.02 + 0.04 * amt) * amt);
    col = mix(col, vec3(dot(col, vec3(0.33))) * 0.4, drop);
    col += (hash(st * uRes + uTime) - 0.5) * 0.18 * amt;
    col *= 1.0 - 0.12 * amt * step(0.5, fract(st.y * uRes.y * 0.25));
  }

  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * (0.95 + 0.55 * uN);
  gl_FragColor = vec4(col, 1.0);
}
`;

function rr(
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

/** A recognisable YouTube watch page, monochrome with red accents. */
function drawPlate(c: HTMLCanvasElement, w: number, h: number) {
  const x = c.getContext("2d");
  if (!x) return;
  c.width = w;
  c.height = h;
  const s = w / 1440;
  x.fillStyle = "#0b0b0c";
  x.fillRect(0, 0, w, h);

  // top bar — YouTube logo + search
  x.fillStyle = "#ff3322";
  rr(x, 70 * s, 30 * s, 46 * s, 32 * s, 7 * s);
  x.fill();
  x.fillStyle = "#0b0b0c";
  x.beginPath();
  x.moveTo(86 * s, 39 * s);
  x.lineTo(86 * s, 53 * s);
  x.lineTo(99 * s, 46 * s);
  x.closePath();
  x.fill();
  x.strokeStyle = "rgba(120,120,130,0.5)";
  x.lineWidth = 1 * s;
  rr(x, 470 * s, 30 * s, 420 * s, 34 * s, 17 * s);
  x.stroke();
  x.fillStyle = "rgba(120,120,130,0.45)";
  x.beginPath();
  x.arc(1330 * s, 47 * s, 17 * s, 0, 7);
  x.fill();

  // main video — no bright play button (it fought the hero type)
  x.fillStyle = "#161619";
  x.fillRect(70 * s, 96 * s, 850 * s, 478 * s);
  // AD marker + SKIP AD pill
  x.fillStyle = "#ffcc00";
  x.fillRect(70 * s, 540 * s, 30 * s, 18 * s);
  x.fillStyle = "rgba(0,0,0,0.55)";
  rr(x, 780 * s, 520 * s, 124 * s, 40 * s, 4 * s);
  x.fill();
  x.fillStyle = "#fff";
  x.font = `${15 * s}px monospace`;
  x.fillText("SKIP AD ▷", 798 * s, 545 * s);

  // title + action chips
  x.fillStyle = "rgba(150,150,160,0.85)";
  x.fillRect(70 * s, 600 * s, 560 * s, 22 * s);
  x.fillStyle = "rgba(90,90,100,0.6)";
  x.fillRect(70 * s, 634 * s, 320 * s, 14 * s);
  for (let i = 0; i < 5; i++) {
    x.fillStyle = "rgba(70,70,80,0.5)";
    rr(x, (70 + i * 120) * s, 672 * s, 104 * s, 36 * s, 18 * s);
    x.fill();
  }
  // comments
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

  // recommendation rail — clearly "more more more"
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

const NoiseCanvas = forwardRef<NoiseHandle, { variant?: HeroVariant }>(
  function NoiseCanvas({ variant = "signal" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nRef = useRef(1);
    const varRef = useRef(VARIANT_INDEX[variant]);
    const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

    useImperativeHandle(ref, () => ({
      setProgress: (p: number) => {
        nRef.current = 1 - Math.min(1, Math.max(0, p));
      },
    }));

    useEffect(() => {
      varRef.current = VARIANT_INDEX[variant];
    }, [variant]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = canvas.getContext("webgl", { antialias: false });
      if (!gl) return;

      const sh = (t: number, src: string) => {
        const o = gl.createShader(t)!;
        gl.shaderSource(o, src);
        gl.compileShader(o);
        return o;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uN = gl.getUniformLocation(prog, "uN");
      const uTime = gl.getUniformLocation(prog, "uTime");
      const uVar = gl.getUniformLocation(prog, "uVar");
      const uRes = gl.getUniformLocation(prog, "uRes");
      const uMouse = gl.getUniformLocation(prog, "uMouse");

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const plate = document.createElement("canvas");
      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.floor(window.innerWidth * dpr);
        const h = Math.floor(window.innerHeight * dpr);
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
        drawPlate(plate, w, h);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          plate,
        );
      };
      resize();
      window.addEventListener("resize", resize);

      const onMove = (e: PointerEvent) => {
        mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove);

      let raf = 0;
      const t0 = performance.now();
      const loop = () => {
        const m = mouse.current;
        m.x += (m.tx - m.x) * 0.06;
        m.y += (m.ty - m.y) * 0.06;
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.uniform1f(uN, nRef.current);
        gl.uniform1f(uVar, varRef.current);
        gl.uniform2f(uMouse, m.x, m.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(loop);
      };
      loop();

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }, []);

    return <canvas ref={canvasRef} className="r-canvas" aria-hidden />;
  },
);

export default NoiseCanvas;
