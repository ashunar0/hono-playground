import { cn } from "@/lib/cn";
import { usePage } from "@ts-76/inertia-hono-jsx";
import { useEffect, useState } from "hono/jsx";

type ToastType = "success" | "error" | "info";
type Toast = { type: ToastType; message: string };
type Displayed = Toast & { id: number };

const VARIANT_CLASS: Record<ToastType, string> = {
  success: "border-green-200 bg-white",
  error: "border-red-200 bg-white",
  info: "border-gray-200 bg-white",
};

const ICON: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "i",
};

const ICON_CLASS: Record<ToastType, string> = {
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

const AUTO_DISMISS_MS = 3500;

export function Toaster() {
  const page = usePage();
  const flashToast = page.props.toast;
  const [toasts, setToasts] = useState<Displayed[]>([]);

  useEffect(() => {
    if (!flashToast) return;
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...flashToast, id }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [flashToast]);

  if (toasts.length === 0) return null;

  return (
    <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          class={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
            "animate-[toast-slide-in_0.18s_ease-out]",
            VARIANT_CLASS[t.type],
          )}
        >
          <span
            class={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              ICON_CLASS[t.type],
            )}
          >
            {ICON[t.type]}
          </span>
          <p class="flex-1 pt-0.5 text-sm text-gray-900">{t.message}</p>
          <button
            type="button"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            class="text-gray-400 transition-colors hover:text-gray-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
