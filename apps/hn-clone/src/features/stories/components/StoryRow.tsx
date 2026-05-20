import { hostOf, timeAgo } from "@/lib/format";
import { Link } from "@ts-76/inertia-hono-jsx";
import type { StoryListItem } from "../types";

export function StoryRow({ story }: { story: StoryListItem }) {
  // url 付き投稿はタイトルが外部リンク、text 投稿は詳細ページへ。
  const titleHref = story.url ?? `/stories/${story.id}`;
  const external = Boolean(story.url);

  return (
    <li class="flex flex-col gap-0.5 py-2">
      <div class="flex items-baseline gap-1">
        {/* vote ボタンは Phase 5 (楽観的更新) で追加。今は points 表示のみ。 */}
        <a
          href={titleHref}
          {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          class="font-medium text-gray-900 hover:underline"
        >
          {story.title}
        </a>
        {external && <span class="text-xs text-gray-400">({hostOf(story.url!)})</span>}
      </div>
      <div class="text-xs text-gray-500">
        {story.voteCount} points by {story.authorName ?? "unknown"} ·{" "}
        {timeAgo(new Date(story.createdAt))} ·{" "}
        <Link href={`/stories/${story.id}`} class="hover:underline">
          discuss
        </Link>
      </div>
    </li>
  );
}
