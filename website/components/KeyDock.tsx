"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { dockKeys } from "@/lib/site";

const REACH = 150;
const MAX_SCALE = 1.5;
const HOLD_MS = 1800;

export default function KeyDock() {
  const [active, setActive] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  const press = (key: string) => {
    window.clearTimeout(timer.current);
    setActive(key);
    timer.current = window.setTimeout(() => setActive(null), HOLD_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if ((e.target as HTMLElement).closest("input,textarea")) return;
      const key = e.key.toUpperCase();
      if (dockKeys.some((row) => row.keys[0] === key)) press(key);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  const magnify = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    for (const cap of dockRef.current!.children as HTMLCollectionOf<HTMLElement>) {
      const r = cap.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const t = Math.max(0, 1 - d / REACH);
      cap.style.setProperty("--scale", String(1 + (MAX_SCALE - 1) * Math.sin((t * Math.PI) / 2)));
    }
  };

  const relax = () => {
    for (const cap of dockRef.current!.children as HTMLCollectionOf<HTMLElement>) {
      cap.style.removeProperty("--scale");
    }
  };

  const current = dockKeys.find((row) => row.keys[0] === active);

  return (
    <div className="dock rise" style={{ "--d": "0.8s" } as React.CSSProperties}>
      <div
        ref={dockRef}
        className="dock-caps"
        onPointerMove={magnify}
        onPointerLeave={relax}
        role="group"
        aria-label="Default shortcuts"
      >
        {dockKeys.map((row) => (
          <button
            key={row.keys[0]}
            type="button"
            className={"cap" + (active === row.keys[0] ? " is-on" : "")}
            onClick={() => press(row.keys[0])}
            aria-label={`${row.keys[0]}: ${row.name}`}
          >
            {row.keys[0]}
          </button>
        ))}
      </div>
      <p className="dock-caption" aria-live="polite">
        {current ? (
          <>
            <b>{current.name}</b> · {current.blurb}
          </>
        ) : (
          "press a key, or tap one"
        )}
      </p>
    </div>
  );
}
