// A shimmering stand-in sized like the text it replaces, so nothing shifts
// when the runtime arrives. Colours come from the surrounding text.
export const skeletonStyle = `
  .bone {
    display: inline-block; height: 10px; border-radius: 5px; vertical-align: middle;
    background: linear-gradient(90deg, currentColor 0%, currentColor 40%, transparent 50%, currentColor 60%, currentColor 100%);
    background-size: 300% 100%; opacity: .18; animation: shimmer 1.4s ease-in-out infinite;
  }
  @keyframes shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) { .bone { animation: none; } }
`;
