import { Link, usePoll, WhenVisible } from "@ts-76/inertia-hono-jsx";

type Props = {
  serverTime: string | null;
  lazyStats: { computedAt: string; rows: number } | null;
};

export default function RealtimeDemo(props: Props) {
  usePoll(2000, { only: ["serverTime"] });

  return (
    <>
      <h1>Realtime adapter</h1>

      <section>
        <h2>1. usePoll (interval reload)</h2>
        <p>
          Server time: <code data-testid="server-time">{props.serverTime}</code>
        </p>
        <p>
          2 秒ごとに <code>serverTime</code> だけ partial reload。tick で値が更新される。
        </p>
      </section>

      <section>
        <h2>2. WhenVisible (viewport trigger fetch)</h2>
        <p>
          下のスクロール領域の中の WhenVisible は viewport に入った瞬間に partial reload で{" "}
          <code>lazyStats</code> を取りに行く。
        </p>
        <div
          data-testid="visible-panel"
          style="height:18rem;overflow-y:auto;border:1px solid #d1d5db;padding:1rem;"
        >
          <p>↓ 下までスクロールしてね (1.4kpx ほど)</p>
          <div style="height:25rem;background:#fafafa;"></div>
          <WhenVisible data="lazyStats" fallback={<p>Loading stats...</p>}>
            <p data-testid="visible-stats">
              Computed at: <code>{props.lazyStats?.computedAt ?? "-"}</code> / Rows:{" "}
              {props.lazyStats?.rows ?? "-"}
            </p>
          </WhenVisible>
        </div>
      </section>

      <section>
        <h2>3. Link prefetch</h2>
        <p>
          下のリンクは <code>prefetch</code> 付き。hover した時点で /users を先に取りに行く。
        </p>
        <Link href="/users" prefetch>
          Users (with prefetch on hover)
        </Link>
      </section>
    </>
  );
}
