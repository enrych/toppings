import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import ConfirmPopup from "./ConfirmPopup";

interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Wrap the app with this provider to expose the imperative `useConfirm()`
 * hook. The hook returns a function that opens a ConfirmPopup and resolves
 * with `true` (confirmed) or `false` (cancelled / dismissed). Lets call
 * sites stay flat:
 *
 *     const ok = await confirm({ title, message, danger: true });
 *     if (ok) doDestructiveThing();
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOpts(options);
      setOpen(true);
    });
  }, []);

  const close = (value: boolean) => {
    setOpen(false);
    resolverRef.current?.(value);
    resolverRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <ConfirmPopup
          open={open}
          title={opts.title}
          message={opts.message}
          confirmLabel={opts.confirmLabel}
          cancelLabel={opts.cancelLabel}
          danger={opts.danger}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}
