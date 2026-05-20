import type { Task } from "../types";

/** タスク作成フォームの入力。Form/useForm どちらの data もこの形に揃う */
export type TaskDraftInput = {
  title: string;
  dueAt: string;
  tagNames: string;
};

/**
 * 楽観的更新用の仮 Task を作る。サーバ確定前に一覧へ即時表示するための行。
 * id は負数にして server 起源の正 id と衝突させない。
 */
export function makeOptimisticTask(input: TaskDraftInput): Task {
  return {
    id: -Date.now(),
    userId: "",
    title: input.title,
    done: false,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    createdAt: new Date(),
    tags: input.tagNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
