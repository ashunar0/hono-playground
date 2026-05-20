import { Layout } from "@/components/Layout";
import { CommentForm } from "@/features/comments/components/CommentForm";
import { CommentItem } from "@/features/comments/components/CommentItem";
import { VoteButton } from "@/components/VoteButton";
import type { StoryPageProps } from "@/features/stories/types";
import { hostOf, timeAgo } from "@/lib/format";
import { Link, router, usePage } from "@ts-76/inertia-hono-jsx";

export default function Story({ story, comments }: StoryPageProps) {
  const external = Boolean(story.url);
  const user = usePage().props.user;

  const handleVote = () => {
    router
      .optimistic<StoryPageProps>((page) => ({
        story: {
          ...page.story,
          voted: !page.story.voted,
          voteCount: page.story.voteCount + (page.story.voted ? -1 : 1),
        },
      }))
      .post(`/stories/${story.id}/vote`, {}, { preserveScroll: true });
  };

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
        <p class="mt-1 flex items-baseline gap-1 text-xs text-gray-500">
          <VoteButton
            voteCount={story.voteCount}
            voted={story.voted}
            canVote={Boolean(user)}
            onVote={handleVote}
          />
          · by {story.authorName ?? "unknown"} · {timeAgo(new Date(story.createdAt))}
        </p>
        {story.text && <p class="mt-4 whitespace-pre-wrap text-sm text-gray-800">{story.text}</p>}
      </article>

      <section class="border-t border-gray-200 pt-4">
        <h2 class="mb-3 text-sm font-bold text-gray-700">コメント</h2>

        {user ? (
          <CommentForm storyId={story.id} placeholder="コメントを書く…" />
        ) : (
          <p class="text-sm text-gray-400">
            コメントするには
            <Link href="/login" class="text-orange-600 hover:underline">
              ログイン
            </Link>
            なのだ
          </p>
        )}

        {comments.length === 0 ? (
          <p class="mt-4 text-sm text-gray-400">まだコメントがないのだ</p>
        ) : (
          <ul class="mt-2">
            {comments.map((comment) => (
              <CommentItem comment={comment} storyId={story.id} />
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
