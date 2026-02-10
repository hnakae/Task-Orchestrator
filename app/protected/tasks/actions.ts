"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskCreateSchema, taskUpdateSchema } from "@/lib/schemas/task";

/** Task row as returned from Supabase (snake_case) */
export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  importance: number;
  weight: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Get all tasks for the current user, ordered by deadline (nulls last) then created_at */
export async function getTasks(): Promise<ActionResult<TaskRow[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: (data ?? []) as TaskRow[] };
}

/** Create a task. Validates with Zod, sets user_id from auth. */
export async function createTask(
  formData: FormData
): Promise<ActionResult<TaskRow>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const raw = {
    title: formData.get("title") ?? undefined,
    importance: formData.has("importance")
      ? Number(formData.get("importance"))
      : undefined,
    weight: formData.has("weight") ? Number(formData.get("weight")) : undefined,
    deadline: formData.get("deadline")
      ? String(formData.get("deadline"))
      : undefined,
  };

  const parsed = taskCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat().find(Boolean) ?? "Invalid task data";
    return { success: false, error: String(msg) };
  }

  const { title, importance, weight, deadline } = parsed.data;
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title,
      importance,
      weight,
      deadline: deadline?.toISOString() ?? null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/protected/tasks");
  revalidatePath("/protected");
  return { success: true, data: data as TaskRow };
}

/** Update a task by id. Validates with Zod; only updates provided fields. */
export async function updateTask(
  id: string,
  formData: FormData
): Promise<ActionResult<TaskRow>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const raw = {
    title: formData.get("title") ?? undefined,
    importance: formData.has("importance")
      ? Number(formData.get("importance"))
      : undefined,
    weight: formData.has("weight") ? Number(formData.get("weight")) : undefined,
    deadline: formData.get("deadline")
      ? String(formData.get("deadline"))
      : undefined,
  };

  const parsed = taskUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat().find(Boolean) ?? "Invalid task data";
    return { success: false, error: String(msg) };
  }

  const payload: Record<string, unknown> = { ...parsed.data };
  if (payload.deadline !== undefined) {
    payload.deadline =
      payload.deadline instanceof Date
        ? payload.deadline.toISOString()
        : payload.deadline;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/protected/tasks");
  revalidatePath("/protected");
  return { success: true, data: data as TaskRow };
}

/** Delete a task by id (must belong to current user). */
export async function deleteTask(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/protected/tasks");
  revalidatePath("/protected");
  return { success: true };
}
