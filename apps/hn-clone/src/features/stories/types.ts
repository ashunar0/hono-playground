import type { ListQuery } from "./schema";
import type { storiesService } from "./service";

export type StoryListItem = Awaited<ReturnType<typeof storiesService.list>>[number];

export type StoryDetail = NonNullable<Awaited<ReturnType<typeof storiesService.get>>>;

export type HomePageProps = {
  stories: StoryListItem[];
  sort: ListQuery["sort"];
};

export type StoryPageProps = {
  story: StoryDetail;
};
