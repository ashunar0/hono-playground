import type { tasksService } from "./service";

export type Task = Awaited<ReturnType<typeof tasksService.list>>[number];
