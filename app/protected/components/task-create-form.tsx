"use client";

import { useActionState, useEffect } from "react";
import { createTask } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "@/components/ui/label";

export function TaskCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createTask(formData);
      if (result.success) {
        onSuccess?.();
        return null;
      }
      return result.error;
    },
    null
  );

  // Get tomorrow's date for the default deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
  const defaultDeadline = tomorrow.toISOString().slice(0, 16);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Task title"
          defaultValue="New Task"
          required
          maxLength={255}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add more details about this task..."
          defaultValue="Automated task description."
          className="resize-none"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="importance">Importance (1–10)</Label>
          <Input
            id="importance"
            name="importance"
            type="number"
            min={1}
            max={10}
            defaultValue={5}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (1–10)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            min={1}
            max={10}
            defaultValue={5}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input 
          id="deadline" 
          name="deadline" 
          type="datetime-local" 
          defaultValue={defaultDeadline}
        />
      </div>
      {state && (
        <p className="text-sm text-destructive">{state}</p>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Adding…" : "Add task"}
      </Button>
    </form>
  );
}
