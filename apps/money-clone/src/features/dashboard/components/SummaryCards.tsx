import { formatYen, signedYen } from "@/lib/format";
import type { Summary } from "../service";

type Props = { summary: Summary };

export function SummaryCards({ summary }: Props) {
  return (
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card label="収入" value={summary.income} tone="income" />
      <Card label="支出" value={summary.expense} tone="expense" />
      <Card label="差引" value={summary.diff} tone="diff" />
    </div>
  );
}

type CardProps = { label: string; value: number; tone: "income" | "expense" | "diff" };

function Card({ label, value, tone }: CardProps) {
  const valueClass =
    tone === "income"
      ? "text-emerald-700"
      : tone === "expense"
        ? "text-red-600"
        : value >= 0
          ? "text-emerald-700"
          : "text-red-600";
  const display = tone === "diff" ? signedYen(value) : formatYen(value);
  return (
    <div class="rounded border border-gray-200 bg-white p-4">
      <div class="text-xs text-gray-600">{label}</div>
      <div class={`mt-1 font-mono text-2xl font-semibold ${valueClass}`}>{display}</div>
    </div>
  );
}
