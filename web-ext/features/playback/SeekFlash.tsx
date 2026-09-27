/** @jsxImportSource preact */

export interface SeekFlashProps {
  seconds: number;
  side: "back" | "forward";
  visible: boolean;
}

const style = `
  :host { position: absolute; inset: 0; pointer-events: none; z-index: 60; }
  .pill {
    position: absolute; top: 50%; transform: translateY(-50%);
    padding: 10px 18px; border-radius: 999px;
    background: rgba(0, 0, 0, .55); color: #fff;
    font: 500 15px/1 Roboto, Arial, sans-serif; letter-spacing: .01em;
    opacity: 0; transition: opacity .15s ease;
  }
  .pill[data-visible] { opacity: 1; }
  .back { left: 12%; }
  .forward { right: 12%; }
`;

export function SeekFlash({ seconds, side, visible }: SeekFlashProps) {
  const sign = side === "back" ? "−" : "+";
  return (
    <>
      <style>{style}</style>
      <div class={`pill ${side}`} data-visible={visible || undefined}>
        {sign}{seconds}s
      </div>
    </>
  );
}
