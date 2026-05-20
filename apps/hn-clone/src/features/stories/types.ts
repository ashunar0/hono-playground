import type { CommentNode } from "../comments/types";
import type { ListQuery } from "./schema";
import type { storiesService } from "./service";

export type StoryListItem = Awaited<ReturnType<typeof storiesService.listPage>>["items"][number];

export type StoryDetail = NonNullable<Awaited<ReturnType<typeof storiesService.get>>>;

export type HomePageProps = {
  // scroll() が返す配列。InfiniteScroll が次ページを append マージしていく。
  stories: StoryListItem[];
  sort: ListQuery["sort"];
};

export type StoryPageProps = {
  story: StoryDetail;
  comments: CommentNode[];
};
