import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Toast, { ToastData, ToastTone } from "./Toast";

interface ToastApi {
  show: (toast: Omit<ToastData, "id">) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let nextId = 0;
const genId = () => `t${++nextId}`;

interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss duration in ms. 0 = manual only. */
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  defaultDuration = 3500,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = genId();
      const duration = data.duration ?? defaultDuration;
      setToasts((list) => [...list, { ...data, id }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [defaultDuration, dismiss],
  );

  const helper = (tone: ToastTone) => (title: string, description?: string) =>
    show({ tone, title, description });

  const api: ToastApi = {
    show,
    success: helper("success"),
    error: helper("error"),
    info: helper("info"),
    dismiss,
  };

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    },
    [],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="tw-fixed tw-top-4 tw-right-4 tw-z-[10001] tw-flex tw-flex-col tw-gap-2 tw-pointer-events-none">
          {toasts.map((t) => (
            <Toast key={t.id} data={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
