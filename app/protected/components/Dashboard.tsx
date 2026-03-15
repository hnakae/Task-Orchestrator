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
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Dialog open={coursesDialogOpen} onOpenChange={setCoursesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 font-bold transition-all text-xs sm:text-sm h-9 sm:h-10">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="hidden xs:inline">View Courses</span>
                <span className="xs:hidden">Courses</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[500px] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Academic Catalog</DialogTitle>
                <DialogDescription>
                  Manage your active courses and their grading structures.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 sm:py-4 overflow-y-auto max-h-[70vh]">
                <CourseManager />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs sm:text-sm h-9 sm:h-10">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[425px] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Enter the details for your new task below.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 sm:py-4 overflow-y-auto max-h-[70vh]">
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
