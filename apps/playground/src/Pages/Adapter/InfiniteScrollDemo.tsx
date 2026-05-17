import { InfiniteScroll } from "@ts-76/inertia-hono-jsx";

type User = { id: number; name: string };

type Props = {
  manualUsers: User[];
  autoUsers: User[];
};

export default function InfiniteScrollDemo(props: Props) {
  return (
    <>
      <h1>InfiniteScroll adapter</h1>

      <section>
        <h2>1. Manual reverse mode</h2>
        <p>
          Fetch previous で過去の page を <strong>先頭に prepend</strong> する。
        </p>
        <InfiniteScroll
          data="manualUsers"
          manual
          preserveUrl
          reverse
          previous={({ fetch, loading, hasMore }) =>
            loading ? (
              <span>Loading previous users...</span>
            ) : (
              <button type="button" disabled={!hasMore} onClick={() => fetch()}>
                {hasMore ? "Fetch previous" : "No previous users"}
              </button>
            )
          }
        >
          <ul>
            {props.manualUsers.map((user) => (
              <li key={user.id}>Manual {user.name}</li>
            ))}
          </ul>
        </InfiniteScroll>
      </section>

      <section>
        <h2>2. Auto next-page mode</h2>
        <p>
          下の枠をスクロール。下端 trigger が visible になると{" "}
          <strong>自動で次 page を append</strong>。
        </p>
        <div
          data-testid="auto-panel"
          style="border:1px solid #d1d5db;height:10rem;overflow-y:auto;overflow-anchor:none;padding:1rem;overscroll-behavior:contain;"
        >
          <InfiniteScroll
            as="ul"
            data="autoUsers"
            buffer={80}
            preserveUrl
            onlyNext
            loading={<li>Loading more users...</li>}
            next={({ loading, hasMore, autoMode }) =>
              loading ? (
                <span>Loading automatically...</span>
              ) : hasMore && autoMode ? (
                <span>Scroll for more</span>
              ) : (
                <span>No more users</span>
              )
            }
          >
            {props.autoUsers.map((user) => (
              <li key={user.id}>Auto {user.name}</li>
            ))}
          </InfiniteScroll>
        </div>
      </section>
    </>
  );
}
