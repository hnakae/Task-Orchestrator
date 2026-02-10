"use client";

import { useActionState, useState } from "react";
import type { TaskRow } from "./actions";
import { updateTask, deleteTask } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    dateStyle: "short",
    timeStyle: d.getHours() || d.getMinutes() ? "short" : undefined,
  });
}

function TaskItem({ task }: { task: TaskRow }) {
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteAction, isDeleting] = useActionState(
    async (_: unknown, formData: FormData) => {
      const id = formData.get("id") as string;
      const result = await deleteTask(id);
      if (result.success) return null;
      return result.error;
    },
    null
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await updateTask(task.id, formData);
      if (result.success) {
        setEditing(false);
        return null;
      }
      return result.error;
    },
    null
  );

  if (editing) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Edit task</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <form action={updateAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={task.id} />
            <div className="grid gap-2">
              <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
              <Input
                id={`edit-title-${task.id}`}
                name="title"
                defaultValue={task.title}
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor={`edit-importance-${task.id}`}>Importance</Label>
                <Input
                  id={`edit-importance-${task.id}`}
                  name="importance"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={task.importance}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-weight-${task.id}`}>Weight</Label>
                <Input
                  id={`edit-weight-${task.id}`}
                  name="weight"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={task.weight}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-deadline-${task.id}`}>Deadline</Label>
              <Input
                id={`edit-deadline-${task.id}`}
                name="deadline"
                type="datetime-local"
                defaultValue={
                  task.deadline
                    ? new Date(task.deadline).toISOString().slice(0, 16)
                    : ""
                }
              />
            </div>
            {updateState && (
              <p className="text-sm text-destructive">{updateState}</p>
            )}
            <CardFooter className="p-0 flex gap-2">
              <Button type="submit" disabled={isUpdating} size="sm">
                {isUpdating ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-base">{task.title}</CardTitle>
        <div className="flex gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={task.id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
            >
              {isDeleting ? "…" : "Delete"}
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <dl className="text-sm text-muted-foreground grid grid-cols-2 gap-1">
          <dt>Importance</dt>
          <dd>{task.importance}</dd>
          <dt>Weight</dt>
          <dd>{task.weight}</dd>
          <dt>Deadline</dt>
          <dd>{formatDate(task.deadline)}</dd>
        </dl>
        {deleteState && (
          <p className="text-sm text-destructive mt-2">{deleteState}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function TaskList({ initialTasks }: { initialTasks: TaskRow[] }) {
  if (initialTasks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No tasks yet. Add one above.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3 list-none p-0 m-0">
      {initialTasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} />
        </li>
      ))}
    </ul>
  );
}
