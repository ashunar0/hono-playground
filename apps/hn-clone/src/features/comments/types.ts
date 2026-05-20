import type { commentsRepo } from "./repository";

export type CommentRow = Awaited<ReturnType<typeof commentsRepo.listByStory>>[number];

// 再帰ツリーのノード。replies に子コメントがぶら下がる (無限ネスト)。
export type CommentNode = CommentRow & { replies: CommentNode[] };
