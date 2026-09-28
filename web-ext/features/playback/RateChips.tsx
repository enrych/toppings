
export interface RateChipsProps {
  rates: number[];
  current: number;
  onPick: (rate: number) => void;
}

const chipLabel = (rate: number) => (Number.isInteger(rate) ? rate.toFixed(1) : String(rate));

// Rendered inside YouTube's own speed panel with its class names, so the
// chips take YouTube's styling and stay in step with its theme.
export function RateChips({ rates, current, onPick }: RateChipsProps) {
  return (
    <>
      {rates.map((rate) => (
        <div class="ytp-variable-speed-panel-preset-button-wrapper" aria-hidden="false">
          <button
            class="ytp-button ytp-variable-speed-panel-preset-button ytp-variable-speed-panel-button"
            aria-pressed={rate === current}
            onClick={() => onPick(rate)}
          >
            <span>{chipLabel(rate)}</span>
          </button>
          {rate === 1 && <div class="ytp-variable-speed-panel-preset-button-label-text">Normal</div>}
        </div>
      ))}
    </>
  );
}
