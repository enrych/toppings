const FFT_SIZE = 512;
const SMOOTHING = 0.82;

let context: AudioContext | undefined;
const analysers = new WeakMap<HTMLMediaElement, AnalyserNode>();
const untappable = new WeakSet<HTMLMediaElement>();

// Taking a media element's audio is one-way: after createMediaElementSource
// it sounds only through this context, and only while the context runs. A new
// context stays suspended until the page sees a user gesture, so the element
// is taken only once the context is running, never leaving it silent; until
// then this returns null.
export function analyserFor(media: HTMLMediaElement): AnalyserNode | null {
  const existing = analysers.get(media);
  if (existing || untappable.has(media)) return existing ?? null;
  context ??= createContext();
  if (context.state !== "running") return null;
  try {
    const source = context.createMediaElementSource(media);
    const analyser = context.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    source.connect(context.destination);
    source.connect(analyser);
    analysers.set(media, analyser);
    return analyser;
  } catch {
    // An element can be taken once per page, so after an extension reload the
    // previous content script still holds it.
    untappable.add(media);
    return null;
  }
}

function createContext(): AudioContext {
  const created = new AudioContext();
  const resume = () => void created.resume();
  document.addEventListener("pointerdown", resume, { capture: true, once: true });
  document.addEventListener("keydown", resume, { capture: true, once: true });
  resume();
  return created;
}
