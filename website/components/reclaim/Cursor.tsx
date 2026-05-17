"use client";
import { useEffect, useRef } from "react";

/**
 * Custom cursor — the Awwwards staple, done with restraint to match
 * the brand: a thin ember ring that trails the pointer and quietly
 * grows over anything interactive (links, buttons, the keyboard).
 *
 * Bails entirely on touch / no-hover devices and when reduced motion
 * is requested — in those cases the native cursor is left alone.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!fine || reduce) return;

    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      d.style.transform = `translate3d(${mx}px,${my}px,0)`;
      const t = e.target as HTMLElement;
      const hot = t.closest("a,button,[data-cursor],.r-keyrow,.r-feature");
      r.classList.toggle("is-hot", !!hot);
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      r.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    const leave = () => r.classList.add("is-hidden");
    const enter = () => r.classList.remove("is-hidden");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="r-cursor-ring" aria-hidden />
      <div ref={dot} className="r-cursor-dot" aria-hidden />
    </>
  );
}
