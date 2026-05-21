import { currentPeriod, formatPeriod, shiftPeriod } from "@/lib/period";
import { href } from "@/lib/href";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  // 現在表示中の period ('YYYY-MM')。未指定は「全期間」扱い。
  period?: string;
  // 月切替リンクが書き換えない他のフィルタ群。
  baseParams?: Record<string, string | undefined>;
  // Inertia partial reload で更新する props キー。指定すると only に渡される。
  only?: readonly string[];
  // 行き先パス (デフォルト: 現在ページの相対 = "")。
  path?: string;
};

export function MonthPager({ period, baseParams = {}, only, path = "/transactions" }: Props) {
  const todayPeriod = currentPeriod();
  // 「全期間」表示時は今月を起点に prev/next を計算する。
  const anchor = period ?? todayPeriod;
  const prev = shiftPeriod(anchor, -1);
  const next = shiftPeriod(anchor, 1);

  const buildHref = (p?: string) => href(path, { ...baseParams, period: p ?? "" });

  // hono/jsx の Link は @ts-76/inertia-hono-jsx 由来。`only` で partial reload を指示。
  const linkProps = only ? { only: [...only] } : undefined;

  return (
    <div class="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-2">
      <Link
        href={buildHref(prev)}
        {...linkProps}
        class="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
      >
        ◀ 前月
      </Link>
      <div class="flex items-center gap-3">
        <span class="text-base font-semibold">{period ? formatPeriod(period) : "全期間"}</span>
        {period && period !== todayPeriod && (
          <Link
            href={buildHref(todayPeriod)}
            {...linkProps}
            class="text-xs text-blue-600 hover:underline"
          >
            今月へ
          </Link>
        )}
        {period && (
          <Link
            href={buildHref(undefined)}
            {...linkProps}
            class="text-xs text-gray-500 hover:underline"
          >
            全期間
          </Link>
        )}
      </div>
      <Link
        href={buildHref(next)}
        {...linkProps}
        class="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
      >
        翌月 ▶
      </Link>
    </div>
  );
}
