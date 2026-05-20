import { cn } from "./cn";

export const inputClass = (hasError: boolean, extra?: string) =>
  cn(
    "rounded border px-3 py-2 focus:outline-none",
    extra,
    hasError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500",
  );
