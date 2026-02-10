import { z } from "zod";

/** Create task: title + Focus Score inputs (importance, weight, optional deadline) */
export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  importance: z.number().int().min(1).max(10).default(5),
  weight: z.number().int().min(1).max(10).default(5),
  deadline: z.coerce.date().optional(),
});

/** Update task: all fields optional (partial update) */
export const taskUpdateSchema = taskCreateSchema.partial();

/** Full task as returned from DB (id, user_id, timestamps) */
export const taskSchema = taskCreateSchema.extend({
  id: z.string().uuid(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type Task = z.infer<typeof taskSchema>;
