import { themeTokens } from "@/kernel/dom/theme";

export const panelStyle = `
  ${themeTokens}
  :host { display: block; }
  * { box-sizing: border-box; }
  .panel {
    margin: 8px 0 4px; padding: 12px 16px; border-radius: 12px;
    background: var(--tp-raised); border: 1px solid var(--tp-outline); color: var(--tp-text);
    font: 13px/1.4 var(--tp-font);
  }
  .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .header { margin-bottom: 10px; }
  .title { font-weight: 700; letter-spacing: .01em; }
  .grow { flex: 1; }
  .stack { display: flex; flex-direction: column; gap: 6px; }
  button, input { font: inherit; color: inherit; }
  .btn {
    cursor: pointer; border: 0; border-radius: 4px; padding: 3px 8px; font-size: 12px; line-height: 1.4;
    background: transparent; color: var(--tp-text-2);
  }
  .btn:hover { background: var(--tp-additive); color: var(--tp-text); }
  .btn.accent { background: var(--tp-accent); color: #fff; }
  .btn.accent:hover { opacity: .9; }
  .btn.chip { background: var(--tp-additive); color: var(--tp-text-2); padding: 2px 8px; }
  .btn.tiny { padding: 2px 5px; font-size: 11px; }
  .input {
    width: 42px; padding: 2px 4px; border-radius: 4px; text-align: right; font-size: 11px;
    background: var(--tp-additive); border: 1px solid var(--tp-outline); color: var(--tp-text);
  }
  .input.text { width: auto; flex: 1; text-align: left; font-size: 12px; padding: 4px 8px; }
  .dropdown { position: relative; display: inline-block; }
  .menu {
    position: absolute; top: calc(100% + 4px); left: 0; z-index: 9999; min-width: 170px; padding: 4px; border-radius: 8px;
    background: var(--tp-menu); border: 1px solid var(--tp-outline); box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
  }
  .menu .item {
    display: block; width: 100%; text-align: left; cursor: pointer; border: 0; border-radius: 4px; padding: 7px 10px;
    font-size: 12px; background: transparent; color: var(--tp-text);
  }
  .menu .item:hover { background: var(--tp-additive); }
  .menu .item.active { color: var(--tp-accent); font-weight: 600; }
  .empty { padding: 8px 10px; font-size: 12px; color: var(--tp-text-2); font-style: italic; }
  .segment {
    display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px;
    background: var(--tp-additive); border-left: 3px solid var(--seg);
  }
  .segment .index { color: var(--seg); font-weight: 700; min-width: 18px; font-size: 12px; }
  .segment .range { flex: 1; font-variant-numeric: tabular-nums; font-size: 12px; }
  .field { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--tp-text-2); }
  .saved { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 6px 10px; border-radius: 8px; background: var(--tp-additive); border-left: 3px solid transparent; }
  .saved.loaded { border-left-color: var(--tp-accent); background: color-mix(in srgb, var(--tp-accent) 10%, transparent); }
  .saved .name { flex: 1; text-align: left; background: none; border: 0; cursor: pointer; padding: 0; font-size: 13px; }
  .saved.loaded .name { font-weight: 700; }
  .badge { font-size: 10px; color: var(--tp-accent); border: 1px solid var(--tp-accent); border-radius: 3px; padding: 1px 5px; }
`;
