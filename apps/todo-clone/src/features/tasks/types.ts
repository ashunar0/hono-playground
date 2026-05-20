import type { AuthVariables } from "@/middleware/auth";
import type { tasksService } from "./service";
import type { ListFilter } from "./schema";

export type Task = Awaited<ReturnType<typeof tasksService.list>>[number];

export type AuthUser = NonNullable<AuthVariables["user"]>;

export type HomePageProps = {
  /** deferred prop: 初期レンダー時は undefined、<Deferred> 解決後に Task[] */
  tasks?: Task[];
  filter: ListFilter;
  user: AuthUser;
};
