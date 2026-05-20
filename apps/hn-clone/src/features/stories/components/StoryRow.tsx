import { hostOf, timeAgo } from "@/lib/format";
import { VoteButton } from "@/components/VoteButton";
import { Link, router, usePage } from "@ts-76/inertia-hono-jsx";
import type { HomePageProps, StoryListItem } from "../types";

export function StoryRow({ story }: { story: StoryListItem }) {
  // url 付き投稿はタイトルが外部リンク、text 投稿は詳細ページへ。
  const titleHref = story.url ?? `/stories/${story.id}`;
  const external = Boolean(story.url);
  const canVote = Boolean(usePage().props.user);

  const handleVote = () => {
    // サーバ返答を待たず一覧の該当行を即書き換える (楽観的更新)。失敗時は core が巻き戻す。
    router
      .optimistic<HomePageProps>((page) => ({
        stories: page.stories.map((s) =>
          s.id === story.id
            ? { ...s, voted: !s.voted, voteCount: s.voteCount + (s.voted ? -1 : 1) }
            : s,
        ),
      }))
      .post(`/stories/${story.id}/vote`, {}, { preserveScroll: true });
  };

  return (
    <li class="flex items-baseline gap-2 py-2">
      <VoteButton
        voteCount={story.voteCount}
        voted={story.voted}
        canVote={canVote}
        onVote={handleVote}
      />
      <div class="flex min-w-0 flex-col gap-0.5">
        <div class="flex items-baseline gap-1">
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
          by {story.authorName ?? "unknown"} · {timeAgo(new Date(story.createdAt))} ·{" "}
          <Link href={`/stories/${story.id}`} class="hover:underline">
            discuss
          </Link>
        </div>
      </div>
    </li>
  );
}
