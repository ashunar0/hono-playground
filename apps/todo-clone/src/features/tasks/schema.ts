import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;

export const toggleTaskSchema = z.object({
  done: z.boolean(),
});

export type ToggleTaskRequest = z.infer<typeof toggleTaskSchema>;

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
