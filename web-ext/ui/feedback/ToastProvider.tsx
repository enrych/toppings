import { createContext, type ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useContext, useRef, useState } from "preact/hooks";
import Toast, { type ToastData, type ToastTone } from "./Toast";

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DEFAULT_DURATION = 3500;

export function ToastProvider({ children }: { children: ComponentChildren }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counter = useRef(0);

  const dismiss = (id: string) => setToasts((list) => list.filter((t) => t.id !== id));
  const show = (tone: ToastTone) => (title: string, description?: string) => {
    const id = `t${++counter.current}`;
    setToasts((list) => [...list, { id, tone, title, description }]);
    setTimeout(() => dismiss(id), DEFAULT_DURATION);
  };
  const api: ToastApi = { success: show("success"), error: show("error"), info: show("info") };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div class="tw-fixed tw-top-4 tw-right-4 tw-z-[10001] tw-flex tw-flex-col tw-gap-2 tw-pointer-events-none">
          {toasts.map((t) => <Toast key={t.id} data={t} onDismiss={dismiss} />)}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used within a ToastProvider");
  return api;
}
