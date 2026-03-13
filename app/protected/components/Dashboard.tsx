"use client";

import { useState } from "react";
import { TaskList } from "./task-list";
import { TaskCreateForm } from "./task-create-form";
import type { TaskWithAttachments } from "../actions";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function Dashboard({ initialTasks }: { initialTasks: TaskWithAttachments[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Enter the details for your new task below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <TaskCreateForm onSuccess={() => setOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TaskList initialTasks={initialTasks} />
    </div>
  );
}
