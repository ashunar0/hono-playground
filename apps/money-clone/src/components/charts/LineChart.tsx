import { formatYen } from "@/lib/format";
import { scalePoint, scaleLinear } from "d3-scale";

type Point = { period: string; balance: number };
type Props = { data: Point[] };

const WIDTH = 800;
const HEIGHT = 240;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 72 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

// 値域に 10% パディングを入れて max/min を 1000 単位で丸める。
const niceRange = (values: number[]): [number, number] => {
  if (values.length === 0) return [0, 1000];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = Math.max(hi - lo, 1000);
  const pad = span * 0.1;
  const padded = (n: number, dir: 1 | -1): number => {
    const v = n + dir * pad;
    const pow = 10 ** Math.floor(Math.log10(Math.max(Math.abs(v), 1)));
    return Math[dir === 1 ? "ceil" : "floor"](v / pow) * pow;
  };
  return [padded(lo, -1), padded(hi, 1)];
};

export function LineChart({ data }: Props) {
  const [yMin, yMax] = niceRange(data.map((d) => d.balance));
  const x = scalePoint<string>()
    .domain(data.map((d) => d.period))
    .range([0, INNER_W])
    .padding(0.5);
  const y = scaleLinear<number, number>().domain([yMin, yMax]).range([INNER_H, 0]);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + (yMax - yMin) * t);
  const points = data.map((d) => ({ ...d, cx: x(d.period) ?? 0, cy: y(d.balance) }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx} ${p.cy}`).join(" ");
  const zeroY = yMin <= 0 && 0 <= yMax ? y(0) : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      class="w-full"
      role="img"
      aria-label="残高推移グラフ"
    >
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {/* grid + y 軸ラベル */}
        {ticks.map((t) => (
          <g transform={`translate(0, ${y(t)})`}>
            <line x1="0" x2={INNER_W} stroke="#e5e7eb" stroke-dasharray="2 2" />
            <text
              x="-8"
              y="0"
              text-anchor="end"
              dominant-baseline="middle"
              class="fill-gray-500 text-[10px] font-mono"
            >
              {formatYen(Math.round(t))}
            </text>
          </g>
        ))}

        {/* zero line (yMin が負の時のみ強調) */}
        {zeroY !== null && yMin < 0 && (
          <line x1="0" x2={INNER_W} y1={zeroY} y2={zeroY} stroke="#9ca3af" />
        )}

        {/* line + points */}
        <path d={path} fill="none" stroke="#10b981" stroke-width="2" stroke-linejoin="round" />
        {points.map((p) => (
          <circle cx={p.cx} cy={p.cy} r="3" class="fill-white" stroke="#10b981" stroke-width="2">
            <title>{`${p.period} 残高 ${formatYen(p.balance)}`}</title>
          </circle>
        ))}

        {/* x 軸ラベル (MM のみ) */}
        {points.map((p) => (
          <text
            x={p.cx}
            y={INNER_H + 16}
            text-anchor="middle"
            class="fill-gray-600 text-[10px] font-mono"
          >
            {p.period.slice(5)}
          </text>
        ))}
      </g>
    </svg>
  );
}
