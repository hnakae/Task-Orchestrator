"use client";

import { useState } from "react";
import { CourseManager } from "./course-manager";
import { TaskCreateForm } from "./task-create-form";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [coursesDialogOpen, setCoursesDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Dialog open={coursesDialogOpen} onOpenChange={setCoursesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 font-bold transition-all">
                <GraduationCap className="w-4 h-4 text-primary" />
                View Courses
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Academic Catalog</DialogTitle>
                <DialogDescription>
                  Manage your active courses and their grading structures.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <CourseManager />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
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
                <TaskCreateForm onSuccess={() => setTaskDialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {children}
    </div>
  );
}
