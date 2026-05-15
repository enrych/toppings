/**
 * Watch-page product mockup — implements the Claude Design WatchOverlay
 * exactly. Shows a YouTube player with Toppings injected:
 *
 *   - YouTube chrome (menu / wordmark / search / avatar)
 *   - Player with the Audio Mode "veil" — ink-tinted background, amber
 *     speaker icon in a soft amber halo, "Audio mode — Toppings" eyebrow
 *     in amber, then the podcast title and a "video paused · audio
 *     continues" subtext
 *   - Progress bar with a translucent amber loop region between two
 *     amber triangle markers, plus the red fill at 26%
 *   - Controls bar: play, mute, time, two Toppings buttons in amber
 *     (loop + audio mode) each with an amber underline indicator, then
 *     a 2.0x rate chip and fullscreen
 *   - Title and channel row
 *   - "Playlist runtime — Toppings" card with 42h 18m hero number
 *
 * This is product-led visual storytelling — it shows what the extension
 * does in situ. Pure JSX, no client JS; renders as a static composition.
 */
export default function WatchMockup() {
  return (
    <div
      className="overflow-hidden rounded-xl border text-white"
      style={{
        background: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.06)",
        // Warm, layered shadow: a soft amber bloom around the frame
        // plus a deeper ink shadow below. Bridges the cream→ink
        // contrast instead of dropping a hard black halo on the page.
        boxShadow:
          "0 0 0 1px rgba(10,10,10,0.04), 0 40px 80px -20px rgba(10,10,10,0.28), 0 0 60px 10px rgba(252,169,41,0.10)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Browser chrome — YouTube bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          background: "#0f0f0f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="h-6 w-6 rounded-full"
          style={{ background: "rgba(255,255,255,0.10)" }}
          aria-hidden
        />
        {/*
         * YouTube lockup — the red rounded-rectangle play button (the
         * actual YouTube mark) followed by the wordmark. Drawn inline
         * rather than imported so the mockup stays a single component.
         */}
        <div
          className="inline-flex items-center gap-1.5 text-[16px] leading-none tracking-[-0.04em]"
          style={{ fontWeight: 700 }}
        >
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{
              width: 24,
              height: 17,
              borderRadius: 4,
              background: "#FF0033",
            }}
          >
            <svg
              width={9}
              height={11}
              viewBox="0 0 9 11"
              aria-hidden
              style={{ display: "block" }}
            >
              <path d="M0 0v11l8-5.5L0 0z" fill="#fff" />
            </svg>
          </span>
          <span>YouTube</span>
        </div>
        <div
          className="flex-1 max-w-[420px] flex items-center text-[13px]"
          style={{
            background: "#121212",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 999,
            padding: "6px 14px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Search
        </div>
        <div
          className="h-6 w-6 rounded-full"
          style={{ background: "rgba(255,255,255,0.10)" }}
        />
      </div>

      {/* Player viewport with Audio Mode veil */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        <div
          className="absolute inset-0 grid place-items-center text-center"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(252,169,41,0.08), transparent 60%), #0A0A0A",
          }}
        >
          <div className="px-6">
            <div
              className="mx-auto mb-3 grid h-[72px] w-[72px] place-items-center rounded-full"
              style={{ background: "rgba(252,169,41,0.10)" }}
            >
              <svg
                viewBox="0 0 24 24"
                width={32}
                height={32}
                fill="none"
                stroke="#FCA929"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            </div>
            <div
              className="text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "#FCA929", fontWeight: 600 }}
            >
              Audio mode · Toppings
            </div>
            <div
              className="mx-auto mt-3 text-[15px] leading-[1.3]"
              style={{
                color: "#fff",
                fontWeight: 600,
                maxWidth: "26ch",
              }}
            >
              Lex Fridman Podcast #420 — Three hours on focus, sleep, and
              recovery
            </div>
            <div
              className="mt-1.5 text-[12px]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Video stream paused · audio continues
            </div>
          </div>
        </div>

        {/* Progress bar bleed-up bottom */}
        <div className="absolute inset-x-0 bottom-0 h-6 flex items-end">
          <div
            className="relative flex-1"
            style={{
              height: 4,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            {/* Translucent amber loop region between the two markers */}
            <div
              className="absolute top-0 h-full"
              style={{
                left: "22%",
                width: "38%",
                background: "rgba(252,169,41,0.4)",
                borderLeft: "2px solid #FCA929",
                borderRight: "2px solid #FCA929",
              }}
            />
            {/* Red fill */}
            <div
              className="absolute top-0 left-0 h-full"
              style={{ width: "26%", background: "#FF0033" }}
            />
            {/* Marker triangles above the loop bounds */}
            {[22, 60].map((left) => (
              <span
                key={left}
                aria-hidden
                className="absolute"
                style={{
                  top: -8,
                  left: `${left}%`,
                  width: 0,
                  height: 0,
                  transform: "translateX(-50%)",
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "10px solid #FCA929",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: "#0f0f0f", color: "rgba(255,255,255,0.85)" }}
      >
        <CtrlIconBtn label="Play">
          <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
        </CtrlIconBtn>
        <CtrlIconBtn label="Mute" filled>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        </CtrlIconBtn>
        <span
          className="font-mono text-[12px]"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          04:32 / 3:18:47
        </span>
        {/* Toppings buttons — amber + amber underline indicator */}
        <ToppingsCtrlBtn label="Loop segment — Toppings">
          <polyline
            points="17 1 21 5 17 9"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 11V9a4 4 0 0 1 4-4h14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="7 23 3 19 7 15"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 13v2a4 4 0 0 1-4 4H3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </ToppingsCtrlBtn>
        <ToppingsCtrlBtn label="Audio mode — Toppings">
          <polygon
            points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </ToppingsCtrlBtn>
        <div className="flex-1" />
        <span
          className="font-mono text-[12px] rounded px-2 py-1"
          style={{
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          2.0x
        </span>
        <CtrlIconBtn label="Fullscreen">
          <path
            d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
        </CtrlIconBtn>
      </div>

      {/*
       * Title/channel rows from the original handoff are dropped here —
       * the audio-mode veil above already names the podcast, and the
       * YouTube-flavored metadata adds visual weight without
       * Toppings-brand value. The playlist-runtime card below carries
       * the "brand asserts itself" moment instead.
       */}

      {/* Playlist runtime card — the brand asserts itself fully here */}
      <div
        className="mx-4 mb-4 mt-4 rounded-lg px-4 py-3.5"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]"
          style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "#FCA929" }}
          />
          Playlist runtime — Toppings
        </div>
        <div
          className="mt-2 text-[22px] leading-none tracking-[-0.02em]"
          style={{
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          42h 18m
        </div>
        <div
          className="mt-1.5 font-mono text-[11px]"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          147 videos · 38 watched · 109 remain at 2.0x = 21h 09m
        </div>
      </div>
    </div>
  );
}

function CtrlIconBtn({
  label,
  filled,
  children,
}: {
  label: string;
  filled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      tabIndex={-1}
      className="grid h-7 w-7 place-items-center"
      style={{
        background: "transparent",
        border: 0,
        color: "rgba(255,255,255,0.85)",
        cursor: "default",
      }}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

function ToppingsCtrlBtn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      tabIndex={-1}
      className="relative grid h-7 w-7 place-items-center"
      style={{
        background: "transparent",
        border: 0,
        color: "#FCA929",
        cursor: "default",
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
        {children}
      </svg>
      {/* The amber underline indicator that signals "this is Toppings" */}
      <span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -4,
          width: 14,
          height: 2,
          borderRadius: 999,
          background: "#FCA929",
        }}
      />
    </button>
  );
}
