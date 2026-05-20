import { Layout } from "@/components/Layout";
import { StoryRow } from "@/features/stories/components/StoryRow";
import type { HomePageProps } from "@/features/stories/types";
import { cn } from "@/lib/cn";
import { InfiniteScroll, Link } from "@ts-76/inertia-hono-jsx";

export default function Home({ stories, sort }: HomePageProps) {
  const tabClass = (active: boolean) =>
    cn(
      "rounded px-3 py-1 text-sm",
      active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    );

  return (
    <Layout>
      <div class="mb-4 flex items-center gap-2">
        <Link href="/?sort=new" prefetch class={tabClass(sort === "new")}>
          new
        </Link>
        <Link href="/?sort=top" prefetch class={tabClass(sort === "top")}>
          top
        </Link>
      </div>

      {stories.length === 0 ? (
        <p class="text-center text-gray-500">まだ投稿がないのだ</p>
      ) : (
        // data="stories" が scrollProps を読み、末尾が見えたら次ページを append fetch。
        <InfiniteScroll
          data="stories"
          as="ol"
          class="divide-y divide-gray-100"
          buffer={150}
          loading={<p class="py-3 text-center text-xs text-gray-400">読み込み中なのだ…</p>}
        >
          {stories.map((story) => (
            <StoryRow story={story} />
          ))}
        </InfiniteScroll>
      )}
    </Layout>
  );
}
