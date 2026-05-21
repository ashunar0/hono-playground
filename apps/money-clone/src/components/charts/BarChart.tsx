import { formatYen } from "@/lib/format";
import { scaleBand, scaleLinear } from "d3-scale";

type Point = { period: string; income: number; expense: number };
type Props = { data: Point[] };

const WIDTH = 800;
const HEIGHT = 240;
const MARGIN = { top: 12, right: 12, bottom: 28, left: 56 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

// y 軸目盛は 0 + 等間隔 4 本 (= 計 5 ラベル)。max は 1000 円単位で丸める。
const niceMax = (raw: number): number => {
  if (raw <= 0) return 1000;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return Math.ceil(raw / pow) * pow;
};

export function BarChart({ data }: Props) {
  const max = niceMax(Math.max(0, ...data.map((d) => Math.max(d.income, d.expense))));
  const x = scaleBand<string>()
    .domain(data.map((d) => d.period))
    .range([0, INNER_W])
    .paddingInner(0.3)
    .paddingOuter(0.1);
  const y = scaleLinear<number, number>().domain([0, max]).range([INNER_H, 0]);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t);
  const bw = x.bandwidth();

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      class="w-full"
      role="img"
      aria-label="月別収支グラフ"
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
              {t === 0 ? "0" : `${(t / 1000).toLocaleString()}k`}
            </text>
          </g>
        ))}

        {/* 棒 */}
        {data.map((d) => {
          const cx = x(d.period) ?? 0;
          const half = bw / 2;
          return (
            <g transform={`translate(${cx}, 0)`}>
              <rect
                x="0"
                y={y(d.income)}
                width={half - 1}
                height={INNER_H - y(d.income)}
                class="fill-emerald-500"
              >
                <title>{`${d.period} 収入 ${formatYen(d.income)}`}</title>
              </rect>
              <rect
                x={half + 1}
                y={y(d.expense)}
                width={half - 1}
                height={INNER_H - y(d.expense)}
                class="fill-red-500"
              >
                <title>{`${d.period} 支出 ${formatYen(d.expense)}`}</title>
              </rect>
            </g>
          );
        })}

        {/* x 軸ラベル (MM のみ) */}
        {data.map((d) => {
          const cx = (x(d.period) ?? 0) + bw / 2;
          const mm = d.period.slice(5);
          return (
            <text
              x={cx}
              y={INNER_H + 16}
              text-anchor="middle"
              class="fill-gray-600 text-[10px] font-mono"
            >
              {mm}
            </text>
          );
        })}

        {/* baseline */}
        <line x1="0" x2={INNER_W} y1={INNER_H} y2={INNER_H} stroke="#9ca3af" />
      </g>

      {/* 凡例 */}
      <g transform={`translate(${MARGIN.left}, ${HEIGHT - 4})`}>
        <rect x="0" y="-10" width="10" height="10" class="fill-emerald-500" />
        <text x="14" y="-1" class="fill-gray-700 text-[10px]">
          収入
        </text>
        <rect x="50" y="-10" width="10" height="10" class="fill-red-500" />
        <text x="64" y="-1" class="fill-gray-700 text-[10px]">
          支出
        </text>
      </g>
    </svg>
  );
}
