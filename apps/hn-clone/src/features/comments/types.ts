import type { commentsRepo } from "./repository";

export type CommentRow = Awaited<ReturnType<typeof commentsRepo.listByStory>>[number];

// 再帰ツリーのノード。voted は boolean に正規化済 (SQL は 0/1)、replies に子がぶら下がる。
export type CommentNode = Omit<CommentRow, "voted"> & {
  voted: boolean;
  replies: CommentNode[];
};
