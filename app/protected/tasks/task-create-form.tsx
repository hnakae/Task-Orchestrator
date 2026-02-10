"use client";

import { useActionState } from "react";
import { createTask } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TaskCreateForm() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createTask(formData);
      if (result.success) return null;
      return result.error;
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>New task</CardTitle>
        <CardDescription>Add a task with title, importance, weight, and optional deadline.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Task title"
              required
              maxLength={255}
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
            <Input id="deadline" name="deadline" type="datetime-local" />
          </div>
          {state && (
            <p className="text-sm text-destructive">{state}</p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding…" : "Add task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
