"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TaskUncheckedCreateInputSchema, TaskUncheckedUpdateInputSchema } from "@/lib/generated/zod";
import type { Task, Attachment, Course } from "@/lib/generated/prisma/client";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type TaskWithAttachments = Task & { 
  attachments: Attachment[];
  children: (Task & { attachments: Attachment[] })[];
  course?: Course | null;
};

/** Get all courses for the current user */
export async function getCourses(): Promise<ActionResult<Course[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const courses = await prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: courses };
  } catch (error) {
    console.error("Fetch courses error:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

/** Create a new course with optional rubric */
export async function createCourse(name: string, rubric?: any): Promise<ActionResult<Course>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const course = await prisma.course.create({
      data: {
        userId: user.id,
        name,
        rubric: rubric || {}
      }
    });
    revalidatePath("/protected");
    return { success: true, data: course };
  } catch (error) {
    console.error("Create course error:", error);
    return { success: false, error: "Failed to create course" };
  }
}

/** Update a course rubric */
export async function updateCourse(id: string, name: string, rubric: any): Promise<ActionResult<Course>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const course = await prisma.course.update({
      where: { id, userId: user.id },
      data: { name, rubric }
    });
    revalidatePath("/protected");
    return { success: true, data: course };
  } catch (error) {
    console.error("Update course error:", error);
    return { success: false, error: "Failed to update course" };
  }
}

/** Delete a course */
export async function deleteCourse(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // Note: This will fail if there are tasks linked to this course because of foreign key constraints
    // unless we use onDelete: SetNull or Cascade in schema. 
    // Checking schema... it's default (restrict usually in prisma if not specified)
    await prisma.course.delete({
      where: { id, userId: user.id }
    });
    revalidatePath("/protected");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete course error:", error);
    return { success: false, error: "Failed to delete course. Ensure no tasks are linked to it." };
  }
}

/** Get all top-level tasks for the current user, including their sub-tasks */
export async function getTasks(): Promise<ActionResult<TaskWithAttachments[]>> {
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
      where: { 
        userId: user.id,
        parentId: null // Only get top-level tasks
      },
      include: { 
        attachments: true,
        course: true,
        children: {
          include: { attachments: true },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: [
        { position: "asc" },
        { deadline: "asc" },
        { createdAt: "asc" },
      ],
    });
    return { success: true, data: tasks as TaskWithAttachments[] };
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

/** Create a task. Validates with Zod, sets user_id from auth and assigns next position. */
export async function createTask(
  formData: FormData
): Promise<ActionResult<TaskWithAttachments>> {
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
    description: formData.get("description") ?? undefined,
    importance: formData.has("importance")
      ? Number(formData.get("importance"))
      : undefined,
    deadline: formData.get("deadline") && formData.get("deadline") !== ""
      ? new Date(String(formData.get("deadline")))
      : undefined,
    type: formData.get("type") ?? "HOMEWORK",
    courseId: formData.get("courseId") || undefined,
    estimatedPomodoros: formData.has("estimatedPomodoros")
      ? Number(formData.get("estimatedPomodoros"))
      : 1,
    position: nextPosition,
  };


  const parsed = TaskUncheckedCreateInputSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    return { success: false, error: "Invalid task data" };
  }

  // Handle file uploads
  const attachments = formData.getAll("attachments") as File[];
  const uploadedAttachments: { name: string; url: string; type: string }[] = [];

  try {
    for (const file of attachments) {
      if (file.size === 0) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error("File upload error:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      uploadedAttachments.push({
        name: file.name,
        url: publicUrl,
        type: file.type
      });
    }

    const data = await prisma.task.create({
      data: {
        ...parsed.data,
        attachments: {
          create: uploadedAttachments
        }
      },
      include: { 
        attachments: true,
        course: true
      }
    });
    
    revalidatePath("/protected");
    return { success: true, data: data as TaskWithAttachments };
  } catch (error) {
    console.error("Task creation error:", error);
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
): Promise<ActionResult<TaskWithAttachments>> {
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
    description: formData.get("description") ?? undefined,
    importance: formData.has("importance")
      ? Number(formData.get("importance"))
      : undefined,
    deadline: formData.get("deadline")
      ? new Date(String(formData.get("deadline")))
      : undefined,
    type: formData.get("type") ?? undefined,
    courseId: formData.get("courseId") || undefined,
    estimatedPomodoros: formData.has("estimatedPomodoros")
      ? Number(formData.get("estimatedPomodoros"))
      : undefined,
  };

  const parsed = TaskUncheckedUpdateInputSchema.safeParse(raw);
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
      include: { 
        attachments: true,
        course: true
      }
    });
    
    revalidatePath("/protected");
    return { success: true, data: data as TaskWithAttachments };
    } catch (error) {
    return { success: false, error: "Failed to update task" };
    }
    }

/** Toggle a task's completion status. */
export async function toggleTaskCompletion(id: string, isCompleted: boolean): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const task = await prisma.task.findUnique({
      where: { id, userId: user.id },
      select: { parentId: true }
    });

    if (!task) return { success: false, error: "Task not found" };

    // Update the task itself
    await prisma.task.update({
      where: { id, userId: user.id },
      data: { 
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    // Handle parent-child completion sync
    if (task.parentId) {
      if (isCompleted) {
        // If marking as completed, check if all siblings are now complete
        const siblingCount = await prisma.task.count({
          where: { parentId: task.parentId, userId: user.id }
        });
        const completedSiblingCount = await prisma.task.count({
          where: { parentId: task.parentId, userId: user.id, isCompleted: true }
        });

        if (siblingCount === completedSiblingCount) {
          // All sub-tasks are complete, mark parent as complete
          await prisma.task.update({
            where: { id: task.parentId, userId: user.id },
            data: { 
              isCompleted: true,
              completedAt: new Date()
            }
          });
        }
      } else {
        // If marking as incomplete, the parent must also be incomplete
        await prisma.task.update({
          where: { id: task.parentId, userId: user.id },
          data: { 
            isCompleted: false,
            completedAt: null
          }
        });
      }
    }

    revalidatePath("/protected");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Toggle task error:", error);
    return { success: false, error: "Failed to toggle task" };
  }
}

/** Record time spent on a task in seconds. If it's a sub-task, also add to parent. */
export async function addTaskDuration(taskId: string, seconds: number): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId, userId: user.id },
      select: { id: true, parentId: true }
    });

    if (!task) return { success: false, error: "Task not found" };

    // Update the task/sub-task itself
    await prisma.task.update({
      where: { id: taskId, userId: user.id },
      data: { actualSeconds: { increment: seconds } }
    });

    // If it has a parent, also increment the parent's total time
    if (task.parentId) {
      await prisma.task.update({
        where: { id: task.parentId, userId: user.id },
        data: { actualSeconds: { increment: seconds } }
      });
    }

    revalidatePath("/protected");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Add task duration error:", error);
    return { success: false, error: "Failed to update task duration" };
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
    // Get attachments to delete from storage
    const task = await prisma.task.findUnique({
      where: { id, userId: user.id },
      include: { attachments: true }
    });

    if (task) {
      for (const attachment of task.attachments) {
        const filePath = attachment.url.split('task-attachments/').pop();
        if (filePath) {
          await supabase.storage.from('task-attachments').remove([filePath]);
        }
      }
    }

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

    /** Delete all tasks for the current user. */
    export async function deleteAllTasks(): Promise<ActionResult<void>> {
    const supabase = await createClient();
    const {
    data: { user },
    error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
    return { success: false, error: "Not authenticated" };
    }

    try {
    // Delete all files from storage first
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      include: { attachments: true }
    });

    for (const task of tasks) {
      for (const attachment of task.attachments) {
        const filePath = attachment.url.split('task-attachments/').pop();
        if (filePath) {
          await supabase.storage.from('task-attachments').remove([filePath]);
        }
      }
    }

    await prisma.task.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/protected");

    return { success: true, data: undefined }; 
    } catch (error) {
    return { success: false, error: "Failed to delete all tasks" };
    }
    }

/** 
 * Smart Task Decomposition.
 * Breaks a single task into smaller, actionable sub-tasks.
 */
export async function decomposeTask(taskId: string): Promise<ActionResult<{ subTasks: string[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: user.id }
  });

  if (!task) return { success: false, error: "Task not found" };

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { success: false, error: "DeepSeek API key missing" };

  const prompt = `
    You are an expert project manager. Break down the following task into 3-5 atomic, actionable steps.
    Each step should be clear, concise, and start with a strong verb.
    
    Task: ${task.title}
    Description: ${task.description || "No description provided."}
    
    Return your response in EXACTLY this JSON format:
    {
      "subTasks": ["Step 1...", "Step 2...", ...]
    }
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a productivity expert that only responds in JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("DeepSeek API error");

    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);

    // Get max position to append sub-tasks
    const maxTask = await prisma.task.findFirst({
      where: { userId: user.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    let currentPos = (maxTask?.position ?? -1) + 1;

    // Create the new sub-tasks in the DB
    await prisma.$transaction(
      content.subTasks.map((title: string) => 
        prisma.task.create({
          data: {
            userId: user.id,
            title,
            description: `Sub-task of: ${task.title}`,
            importance: task.importance,
            type: task.type,
            parentId: taskId, // Link to parent
            position: currentPos++
          }
        })
      )
    );

    revalidatePath("/protected");
    return { success: true, data: content };
  } catch (error) {
    console.error("Decomposition Error:", error);
    return { success: false, error: "Failed to break down task." };
  }
}

/** 
 * Advanced AI Analysis and Optimization of tasks. 
 * This calls DeepSeek to evaluate the tasks based on title, description, importance, type, course, deadline, and pomodoros.
 */
export async function getAIOptimizedFocus(tasks: TaskWithAttachments[]): Promise<ActionResult<{ recommendation: string; optimizedIds: string[] }>> {
  if (tasks.length === 0) return { success: false, error: "No tasks to analyze." };

  const genericWeights: Record<string, number> = {
    'FINAL': 30,
    'MIDTERM1': 20,
    'MIDTERM2': 20,
    'HOMEWORK': 20,
    'QUIZ': 10,
    'PROJECT': 15,
    'REMINDER': 5
  };

  // Local fallback algorithm
  const getLocalFallback = (message: string): ActionResult<{ recommendation: string; optimizedIds: string[] }> => {
    const sortedIds = [...tasks]
      .sort((a, b) => {
        // Use course specific rubric if available
        const rubricA = a.course?.rubric as Record<string, number> | null;
        const wA = (rubricA && rubricA[a.type]) ? rubricA[a.type] : (genericWeights[a.type] || 0);
        
        const rubricB = b.course?.rubric as Record<string, number> | null;
        const wB = (rubricB && rubricB[b.type]) ? rubricB[b.type] : (genericWeights[b.type] || 0);
        
        // 1. Primary sort: impact (Weight % * Points)
        const scoreA = wA * a.importance;
        const scoreB = wB * b.importance;
        if (scoreA !== scoreB) return scoreB - scoreA;
        
        // 2. Secondary sort: Deadline (closer first)
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB;

        // 3. Tertiary sort: Estimated Effort (Pomodoros) - prioritize slightly longer tasks if same score/date
        return b.estimatedPomodoros - a.estimatedPomodoros;
      })
      .map(t => t.id);

    return { 
      success: true, 
      data: {
        recommendation: message,
        optimizedIds: sortedIds
      }
    };
  };

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return getLocalFallback("AI analysis requires a DeepSeek API key. Currently using multi-criteria academic weighting fallback.");
  }

  const taskData = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    points: t.importance,
    deadline: t.deadline,
    type: t.type,
    courseName: t.course?.name || "General",
    courseRubric: t.course?.rubric || genericWeights,
    estimatedPomodoros: t.estimatedPomodoros,
    attachmentCount: t.attachments.length
  }));

  const prompt = `
    You are a world-class academic advisor and productivity expert. Analyze the following student tasks and determine the absolute best order to tackle them for maximum efficiency and academic success.

    Tasks:
    ${JSON.stringify(taskData, null, 2)}

    PRIORITIZATION RULES:
    1. ACADEMIC IMPACT: Prioritize by total grade impact (Course Rubric Weight % * Points).
    2. URGENCY: Factor in deadlines (Due Date). Tasks due sooner get a significant boost.
    3. EFFORT & FLOW: Use Estimated Pomodoros and Complexity (description/attachments) to balance high-effort deep work with quick wins.
    4. STRATEGY: Group work for the same course together if deadlines allow to reduce context switching.
    5. TASK NATURE: Consider if the Task Title/Description implies dependencies or prerequisites.

    Return your response in EXACTLY this JSON format:
    {
      "reasoning": "A concise (2-3 sentences) professional explanation of why this specific order is optimal, citing high-impact items and urgency.",
      "orderedIds": ["id1", "id2", ...]
    }
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a world-class academic advisor and productivity expert that only responds in JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("DeepSeek Rate Limit hit. Falling back to local algorithm.");
        return getLocalFallback("DeepSeek is currently busy (rate limit hit). Using standard category priority algorithm for now.");
      }
      if (response.status === 402) {
        console.warn("DeepSeek API: Payment Required. Please check your account balance.");
        return getLocalFallback("DeepSeek API requires a positive balance. Please top up your account or check your API key.");
      }
      throw new Error(`DeepSeek API Error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.choices || result.choices.length === 0) {
      throw new Error("No AI choices returned.");
    }

    const content = JSON.parse(result.choices[0].message.content);
    return { 
      success: true, 
      data: {
        recommendation: content.reasoning,
        optimizedIds: content.orderedIds
      }
    };
  } catch (error: any) {
    console.error("AI Optimization Error:", error);
    return getLocalFallback("AI failed to respond. Falling back to standard category priority algorithm.");
  }
}

