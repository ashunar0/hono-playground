import { VoteButton } from "@/components/VoteButton";
import { timeAgo } from "@/lib/format";
import { router, usePage } from "@ts-76/inertia-hono-jsx";
import { useState } from "hono/jsx";
import type { CommentNode } from "../types";
import { CommentForm } from "./CommentForm";

// ツリーを再帰的に辿り、対象 id のノードだけ投票をトグルした新ツリーを返す (楽観更新用)。
const toggleVote = (nodes: CommentNode[], id: number): CommentNode[] =>
  nodes.map((n) =>
    n.id === id
      ? { ...n, voted: !n.voted, voteCount: n.voteCount + (n.voted ? -1 : 1) }
      : { ...n, replies: toggleVote(n.replies, id) },
  );

export function CommentItem({ comment, storyId }: { comment: CommentNode; storyId: number }) {
  const [replying, setReplying] = useState(false);
  const user = usePage().props.user;

  const handleVote = () => {
    // comments ツリーを再帰 map して該当ノードだけ即書き換え。TProps は触る範囲だけ記述。
    router
      .optimistic<{ comments: CommentNode[] }>((page) => ({
        comments: toggleVote(page.comments, comment.id),
      }))
      .post(`/comments/${comment.id}/vote`, {}, { preserveScroll: true });
  };

  return (
    <li class="mt-3">
      <div class="flex items-baseline gap-2 text-xs text-gray-500">
        <VoteButton
          voteCount={comment.voteCount}
          voted={comment.voted}
          canVote={Boolean(user)}
          onVote={handleVote}
        />
        <span>
          {comment.authorName ?? "unknown"} · {timeAgo(new Date(comment.createdAt))}
        </span>
      </div>
      <p class="whitespace-pre-wrap text-sm text-gray-800">{comment.text}</p>

      {user && (
        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          class="text-xs text-gray-400 hover:text-gray-700"
        >
          {replying ? "キャンセル" : "返信"}
        </button>
      )}
      {replying && (
        <div class="mt-2">
          <CommentForm storyId={storyId} parentId={comment.id} placeholder="返信を書く…" />
        </div>
      )}

      {/* 子コメントを再帰描画。インデントは左ボーダー + padding で表現。 */}
      {comment.replies.length > 0 && (
        <ul class="mt-1 ml-3 border-l border-gray-200 pl-3">
          {comment.replies.map((child) => (
            <CommentItem comment={child} storyId={storyId} />
          ))}
        </ul>
      )}
    </li>
  );
}
