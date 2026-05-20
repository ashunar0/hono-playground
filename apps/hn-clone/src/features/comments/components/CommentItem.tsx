import { timeAgo } from "@/lib/format";
import { usePage } from "@ts-76/inertia-hono-jsx";
import { useState } from "hono/jsx";
import type { CommentNode } from "../types";
import { CommentForm } from "./CommentForm";

export function CommentItem({ comment, storyId }: { comment: CommentNode; storyId: number }) {
  const [replying, setReplying] = useState(false);
  const user = usePage().props.user;

  return (
    <li class="mt-3">
      <div class="text-xs text-gray-500">
        {comment.authorName ?? "unknown"} · {timeAgo(new Date(comment.createdAt))}
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
