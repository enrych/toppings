import { mount } from "./mount";

const style = `
  .toast {
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 2147483647;
    padding: 8px 16px; border-radius: 8px; white-space: nowrap; pointer-events: none; user-select: none;
    background: rgba(15, 15, 15, .88); backdrop-filter: blur(8px); color: #fff;
    font: 500 13px/1.4 Roboto, system-ui, sans-serif; letter-spacing: .01em;
    box-shadow: 0 4px 16px rgba(0, 0, 0, .3);
    opacity: 0; transition: opacity .15s ease;
  }
  .toast[data-visible] { opacity: 1; }
`;

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <>
      <style>{style}</style>
      <div class="toast" data-visible={visible || undefined}>{message}</div>
    </>
  );
}

let ui: ReturnType<typeof mount> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

// One shared element: rapid calls replace the message rather than stacking.
export function showToast(message: string, duration = 2000): void {
  if (!ui || !ui.host.isConnected) ui = mount("tppng-toast", document.body, <Toast message={message} visible={false} />);
  ui.update(<Toast message={message} visible />);
  clearTimeout(timer);
  timer = setTimeout(() => ui?.update(<Toast message={message} visible={false} />), duration);
}
