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
  button, input, select { font: inherit; color: inherit; }
  .btn {
    cursor: pointer; border: 0; border-radius: 4px; padding: 3px 8px; font-size: 12px; line-height: 1.4;
    background: transparent; color: var(--tp-text-2);
  }
  .btn:hover { background: var(--tp-additive); color: var(--tp-text); }
  .btn.accent { background: var(--tp-accent); color: #fff; }
  .btn.accent:hover { opacity: .9; }
  .btn.chip { background: var(--tp-additive); color: var(--tp-text-2); padding: 2px 8px; }
  .btn.active { color: var(--tp-accent); }
  .btn.tiny { padding: 2px 5px; font-size: 11px; }
  .input {
    width: 42px; padding: 2px 4px; border-radius: 4px; text-align: right; font-size: 11px;
    background: var(--tp-additive); border: 1px solid var(--tp-outline); color: var(--tp-text);
  }
  .input.text { width: auto; flex: 1; text-align: left; font-size: 12px; padding: 4px 8px; }
  .input.short { width: 70px; text-align: left; }
  .dropdown { position: relative; display: inline-block; }
  .menu {
    position: absolute; top: calc(100% + 4px); z-index: 9999; min-width: 170px; padding: 4px; border-radius: 8px;
    background: var(--tp-menu); border: 1px solid var(--tp-outline); box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
  }
  .menu.left { left: 0; } .menu.right { right: 0; }
  .menu .item {
    display: block; width: 100%; text-align: left; cursor: pointer; border: 0; border-radius: 4px; padding: 7px 10px;
    font-size: 12px; background: transparent; color: var(--tp-text);
  }
  .menu .item:hover { background: var(--tp-additive); }
  .menu .item.active { color: var(--tp-accent); font-weight: 600; }
  .menu .item.muted { color: var(--tp-text-2); font-size: 11px; }
  .menu .hint { padding: 4px 10px 6px; font-size: 11px; color: var(--tp-text-2); border-bottom: 1px solid var(--tp-outline); margin-bottom: 4px; }
  .menu .divider { border-top: 1px solid var(--tp-outline); margin-top: 4px; padding-top: 4px; }
  .empty { padding: 8px 10px; font-size: 12px; color: var(--tp-text-2); font-style: italic; }
  .segment {
    display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px;
    background: var(--tp-additive); border-left: 3px solid var(--seg);
  }
  .segment .index { color: var(--seg); font-weight: 700; min-width: 18px; font-size: 12px; }
  .segment .range { flex: 1; font-variant-numeric: tabular-nums; font-size: 12px; }
  .segment .note { font-size: 11px; color: var(--tp-text-2); font-style: italic; }
  .field { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--tp-text-2); }
  .step { padding: 8px 10px; border-radius: 8px; background: var(--tp-additive); display: flex; flex-direction: column; gap: 6px; }
  .step .name { font-size: 11px; font-weight: 600; color: var(--tp-text-2); min-width: 44px; }
  .chips { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; min-width: 0; }
  .segchip {
    display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px 2px 8px; border-radius: 4px; font-size: 11px;
    cursor: grab; user-select: none; background: color-mix(in srgb, var(--seg) 15%, transparent); border: 1px solid var(--seg);
  }
  .segchip[data-over] { outline: 2px solid var(--seg); }
  .segchip .grip { opacity: .4; font-size: 9px; }
  .segchip .x { background: none; border: 0; cursor: pointer; padding: 0; font-size: 10px; line-height: 1; opacity: .6; }
  .select { padding: 2px 4px; border-radius: 4px; font-size: 11px; background: var(--tp-additive); border: 1px solid var(--tp-outline); }
  .saved { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 6px 10px; border-radius: 8px; background: var(--tp-additive); border-left: 3px solid transparent; }
  .saved.loaded { border-left-color: var(--tp-accent); background: color-mix(in srgb, var(--tp-accent) 10%, transparent); }
  .saved .name { flex: 1; text-align: left; background: none; border: 0; cursor: pointer; padding: 0; font-size: 13px; }
  .saved.loaded .name { font-weight: 700; }
  .badge { font-size: 10px; color: var(--tp-accent); border: 1px solid var(--tp-accent); border-radius: 3px; padding: 1px 5px; }
  .disclosure { width: 100%; text-align: left; padding: 4px 0; }
`;
