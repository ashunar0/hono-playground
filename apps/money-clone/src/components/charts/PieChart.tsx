import { formatYen } from "@/lib/format";

type Slice = { name: string; color: string; total: number };
type Props = { data: Slice[] };

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUT = 100;
const R_IN = 60;
// 12 時方向を 0 にして時計回りで描く。
const START_ANGLE = -Math.PI / 2;

// 単一スライス (100%) は SVG path 1 本では描けないので、円 + ドーナツ穴で扱う。
const arcPath = (a0: number, a1: number): string => {
  const x0o = CX + R_OUT * Math.cos(a0);
  const y0o = CY + R_OUT * Math.sin(a0);
  const x1o = CX + R_OUT * Math.cos(a1);
  const y1o = CY + R_OUT * Math.sin(a1);
  const x0i = CX + R_IN * Math.cos(a0);
  const y0i = CY + R_IN * Math.sin(a0);
  const x1i = CX + R_IN * Math.cos(a1);
  const y1i = CY + R_IN * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${x0o} ${y0o}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${x1o} ${y1o}`,
    `L ${x1i} ${y1i}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${x0i} ${y0i}`,
    "Z",
  ].join(" ");
};

export function PieChart({ data }: Props) {
  const total = data.reduce((acc, d) => acc + d.total, 0);
  if (total <= 0) return null;

  let angle = START_ANGLE;
  const slices = data.map((d) => {
    const a0 = angle;
    const a1 = angle + (d.total / total) * Math.PI * 2;
    angle = a1;
    return { ...d, a0, a1, ratio: d.total / total };
  });

  return (
    <div class="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        class="w-44 shrink-0 md:w-56"
        role="img"
        aria-label="カテゴリ別支出ドーナツチャート"
      >
        {slices.length === 1 ? (
          <>
            <circle cx={CX} cy={CY} r={R_OUT} fill={slices[0].color} />
            <circle cx={CX} cy={CY} r={R_IN} class="fill-white" />
          </>
        ) : (
          slices.map((s) => (
            <path d={arcPath(s.a0, s.a1)} fill={s.color}>
              <title>{`${s.name} ${formatYen(s.total)} (${(s.ratio * 100).toFixed(1)}%)`}</title>
            </path>
          ))
        )}
        <text x={CX} y={CY - 4} text-anchor="middle" class="fill-gray-500 text-[10px]">
          合計
        </text>
        <text x={CX} y={CY + 14} text-anchor="middle" class="fill-gray-900 text-sm font-semibold">
          {formatYen(total)}
        </text>
      </svg>
      <ul class="grid flex-1 grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        {slices.map((s) => (
          <li class="flex items-center gap-2">
            <span
              class="inline-block h-3 w-3 rounded-full"
              style={`background-color: ${s.color}`}
              aria-hidden="true"
            />
            <span class="flex-1 truncate text-gray-700">{s.name}</span>
            <span class="font-mono text-gray-500 text-xs">{(s.ratio * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
