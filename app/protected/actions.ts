"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TaskCreateInputSchema, TaskUpdateInputSchema } from "@/lib/generated/zod";
import type { Task } from "@/lib/generated/prisma/client";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Get all tasks for the current user, ordered by position, then deadline (nulls last) then created_at */
export async function getTasks(): Promise<ActionResult<Task[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: [
        { position: "asc" },
        { deadline: "asc" },
        { createdAt: "asc" },
      ],
    });
    return { success: true, data: tasks };
  } catch (error) {
    return { success: false, error: "Failed to fetch tasks" };
  }
}

/** Create a task. Validates with Zod, sets user_id from auth and assigns next position. */
export async function createTask(
  formData: FormData
): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Find max position to assign next one
  const maxTask = await prisma.task.findFirst({
    where: { userId: user.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const nextPosition = (maxTask?.position ?? -1) + 1;

  const raw = {
    userId: user.id,
    title: formData.get("title") ?? undefined,
    importance: formData.has("importance")
      ? Number(formData.get("importance"))
      : undefined,
    weight: formData.has("weight") ? Number(formData.get("weight")) : undefined,
    deadline: formData.get("deadline") && formData.get("deadline") !== ""
      ? new Date(String(formData.get("deadline")))
      : undefined,
    position: nextPosition,
  };

  const parsed = TaskCreateInputSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    return { success: false, error: "Invalid task data" };
  }

  try {
    const data = await prisma.task.create({
      data: parsed.data,
    });
    
    revalidatePath("/protected");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to create task" };
  }
}

/** Update multiple task positions at once. */
export async function updateTaskOrder(
  taskPositions: { id: string; position: number }[]
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // We can't do a bulk update with Prisma easily, so we use a transaction
    await prisma.$transaction(
      taskPositions.map(({ id, position }) =>
        prisma.task.update({
          where: { id, userId: user.id },
          data: { position },
        })
      )
    );

    revalidatePath("/protected");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: "Failed to update task order" };
  }
}

/** Update a task by id. Validates with Zod; only updates provided fields. */
export async function updateTask(
  id: string,
  formData: FormData
): Promise<ActionResult<Task>> {
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
      ? new Date(String(formData.get("deadline")))
      : undefined,
  };

  const parsed = TaskUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid task data" };
  }

  try {
    const data = await prisma.task.update({
      where: { 
        id, 
        userId: user.id // Ensure the task belongs to the user before updating
      },
      data: parsed.data,
    });
    
    revalidatePath("/protected");
    return { success: true, data };
    } catch (error) {
    return { success: false, error: "Failed to update task" };
    }
    }

    /** Delete a task by id (must belong to current user). */
    export async function deleteTask(id: string): Promise<ActionResult<void>> {
    const supabase = await createClient();
    const {
    data: { user },
    error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
    return { success: false, error: "Not authenticated" };
    }

    try {
    await prisma.task.delete({
      where: { 
        id, 
        userId: user.id 
      },
    });

    revalidatePath("/protected");

    return { success: true, data: undefined }; 
    } catch (error) {
    return { success: false, error: "Failed to delete task" };
    }
    }
