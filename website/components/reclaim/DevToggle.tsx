"use client";

export default function DevToggle() {
  return (
    <div className="r-dev" data-cursor>
      <span className="r-dev-tag">DEV</span>
      <div className="r-dev-row">
        <b>Hero</b>
        <button className="is-on" disabled>
          editorial
        </button>
      </div>
    </div>
  );
}
