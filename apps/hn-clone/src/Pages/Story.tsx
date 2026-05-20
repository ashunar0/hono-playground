import { Layout } from "@/components/Layout";
import type { StoryPageProps } from "@/features/stories/types";
import { hostOf, timeAgo } from "@/lib/format";

export default function Story({ story }: StoryPageProps) {
  const external = Boolean(story.url);

  return (
    <Layout>
      <article class="mb-6">
        <h1 class="flex items-baseline gap-2 text-lg font-bold">
          {external ? (
            <a
              href={story.url!}
              target="_blank"
              rel="noreferrer noopener"
              class="text-gray-900 hover:underline"
            >
              {story.title}
            </a>
          ) : (
            <span class="text-gray-900">{story.title}</span>
          )}
          {external && (
            <span class="text-xs font-normal text-gray-400">({hostOf(story.url!)})</span>
          )}
        </h1>
        <p class="mt-1 text-xs text-gray-500">
          {story.voteCount} points by {story.authorName ?? "unknown"} ·{" "}
          {timeAgo(new Date(story.createdAt))}
        </p>
        {story.text && <p class="mt-4 whitespace-pre-wrap text-sm text-gray-800">{story.text}</p>}
      </article>

      {/* コメントは Phase 4 (フルツリー) で実装。今は枠だけ。 */}
      <section class="border-t border-gray-200 pt-4">
        <h2 class="mb-2 text-sm font-bold text-gray-700">コメント</h2>
        <p class="text-sm text-gray-400">コメント機能は準備中なのだ</p>
      </section>
    </Layout>
  );
}
