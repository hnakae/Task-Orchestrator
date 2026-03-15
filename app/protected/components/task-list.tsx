"use client";

import { useActionState, useState, useEffect, use, Suspense } from "react";
import { 
  updateTask, 
  deleteTask, 
  updateTaskOrder, 
  deleteAllTasks, 
  decomposeTask, 
  toggleTaskCompletion, 
  getCourses,
  addTaskDuration,
  getTasks,
  TaskWithAttachments,
  ActionResult
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Sparkles, 
  Trash2, 
  Split, 
  BookOpen, 
  ListTodo,
  FileText, 
  Paperclip, 
  ExternalLink, 
  Timer, 
  Circle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  Trophy,
  FileCheck,
  GraduationCap,
  Bell,
  Eye,
  CalendarDays,
  Clock3,
  Info,
  ExternalLink as LinkIcon
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { PomodoroTimer } from "./pomodoro-timer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { AIOptimizationEngine } from "./AIOptimizationEngine";
import { TaskListHeader } from "./TaskListHeader";
import { Skeleton } from "./ui/skeleton";

function formatDate(date: Date | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: d.getHours() || d.getMinutes() ? "short" : undefined,
  });
}

function getTaskTypeInfo(type: string) {
  switch (type) {
    case "FINAL":
      return { icon: Trophy, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-900/50", label: "Final" };
    case "MIDTERM1":
      return { icon: FileCheck, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-900/50", label: "Midterm 1" };
    case "MIDTERM2":
      return { icon: FileCheck, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-900/50", label: "Midterm 2" };
    case "PROJECT":
      return { icon: GraduationCap, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-900/50", label: "Project" };
    case "HOMEWORK":
      return { icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-900/50", label: "Homework" };
    case "QUIZ":
      return { icon: ListTodo, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900/50", label: "Quiz" };
    case "REMINDER":
      return { icon: Bell, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-950/30", border: "border-slate-200 dark:border-slate-900/50", label: "Reminder" };
    default:
      return { icon: Circle, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border", label: type };
  }
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/**
 * Helper to optimistically update the task list UI when a task is toggled.
 * Handles parent-child relationships and timer resets.
 */
function applyOptimisticToggle(
  tasks: TaskWithAttachments[], 
  targetId: string, 
  isCompleted: boolean
): TaskWithAttachments[] {
  return tasks.map(t => {
    // 1. Is this the top-level task being toggled?
    if (t.id === targetId) {
      // Toggle all children to match the parent's new state
      const updatedChildren = t.children 
        ? t.children.map(c => ({ 
            ...c, 
            isCompleted, 
            completedAt: isCompleted ? new Date() : null, 
            actualSeconds: isCompleted ? (c as any).actualSeconds : 0 
          }))
        : t.children;

      return { 
        ...t, 
        isCompleted, 
        completedAt: isCompleted ? new Date() : null,
        actualSeconds: isCompleted ? (t as any).actualSeconds : 0,
        children: updatedChildren
      } as any;
    }
    
    // 2. Is it a child of this task?
    if (t.children && t.children.length > 0) {
      const childIndex = t.children.findIndex(c => c.id === targetId);
      if (childIndex !== -1) {
        const targetChild = t.children[childIndex];
        const updatedChildren = [...t.children];
        updatedChildren[childIndex] = { 
          ...targetChild, 
          isCompleted, 
          completedAt: isCompleted ? new Date() : null,
          actualSeconds: isCompleted ? (targetChild as any).actualSeconds : 0
        } as any;
        
        let parentCompleted = t.isCompleted;
        let parentSeconds = (t as any).actualSeconds || 0;
        
        if (!isCompleted) {
          // If a sub-task is unchecked, the parent MUST be unchecked
          parentCompleted = false;
          // Subtract child's time from parent
          parentSeconds = Math.max(0, parentSeconds - ((targetChild as any).actualSeconds || 0));
        } else {
          // If all sub-tasks are now checked, parent should be checked
          const allChecked = updatedChildren.every(c => c.isCompleted);
          if (allChecked) parentCompleted = true;
        }
        
        return { 
          ...t, 
          children: updatedChildren, 
          isCompleted: parentCompleted,
          completedAt: parentCompleted ? (t.completedAt || new Date()) : null,
          actualSeconds: parentSeconds
        } as any;
      }
    }
    
    return t;
  });
}

function TaskItem({ 
  task, 
  dragHandleProps, 
  isDragging,
  setTasks
}: { 
  task: TaskWithAttachments & { actualSeconds?: number }; 
  dragHandleProps?: any; 
  isDragging?: boolean;
  setTasks?: React.Dispatch<React.SetStateAction<TaskWithAttachments[] | null>>;
}) {
  const [editing, setEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isStepsExpanded, setIsStepsExpanded] = useState(true);
  const [taskType, setTaskType] = useState<string>(task.type);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(task.courseId || "none");
  
  // Instant visual feedback state
  const [localCompleted, setLocalCompleted] = useState(task.isCompleted);

  // Sync with prop when it changes from server (but keep local if we just clicked)
  useEffect(() => {
    setLocalCompleted(task.isCompleted);
  }, [task.isCompleted]);

  useEffect(() => {
    if (editing) {
      async function loadCourses() {
        const res = await getCourses();
        if (res.success) setCourses(res.data);
      }
      loadCourses();
    }
  }, [editing]);

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
      if (selectedCourseId !== "none") {
        formData.append("courseId", selectedCourseId);
      } else {
        formData.delete("courseId");
      }
      formData.set("type", taskType);

      const result = await updateTask(task.id, formData);
      if (result.success) {
        setEditing(false);
        return null;
      }
      return result.error;
    },
    null
  );

  async function handleDecompose() {
    setIsDecomposing(true);
    const result = await decomposeTask(task.id);
    if (result.success) {
      toast.success(`Broke down into ${result.data.subTasks.length} tasks`);
    } else {
      toast.error(result.error);
    }
    setIsDecomposing(false);
  }

  async function onToggleComplete() {
    const newStatus = !localCompleted;
    
    // 1. INSTANT visual feedback
    setLocalCompleted(newStatus);
    
    // 2. Optimistic parent state update
    if (setTasks) {
      setTasks(current => current ? applyOptimisticToggle(current, task.id, newStatus) : null);
    }

    // 3. Server update
    const result = await toggleTaskCompletion(task.id, newStatus);
    if (result.success) {
      if (setTasks) setTasks(result.data);
    } else {
      toast.error(result.error);
      // Revert local on error
      setLocalCompleted(!newStatus);
      const refetched = await getTasks();
      if (refetched.success && setTasks) setTasks(refetched.data);
    }
  }

  async function onToggleSubTask(childId: string, currentStatus: boolean) {
    const newSubStatus = !currentStatus;
    
    // Parent optimistic update
    if (setTasks) {
      setTasks(current => current ? applyOptimisticToggle(current, childId, newSubStatus) : null);
    }

    const res = await toggleTaskCompletion(childId, newSubStatus);
    if (res.success) {
      if (setTasks) setTasks(res.data);
    } else {
      toast.error(res.error);
      const refetched = await getTasks();
      if (refetched.success && setTasks) setTasks(refetched.data);
    }
  }

  useEffect(() => {
    if (localCompleted) {
      setShowTimer(false);
    }
  }, [localCompleted]);

  const actualTotalSeconds = task.actualSeconds || 0;

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const typeInfo = getTaskTypeInfo(task.type);
  const TypeIcon = typeInfo.icon;


  if (editing) {
    return (
      <Card className={cn(isDragging ? "opacity-50" : "", "border-primary shadow-lg ring-1 ring-primary/20")}>
        <CardHeader className="pb-3 border-b bg-muted/30">
          <CardTitle className="text-base font-bold text-primary text-center">Edit Task Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <form action={updateAction} className="flex flex-col gap-5">
            <input type="hidden" name="id" value={task.id} />
            
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority Category</Label>
              <div className="grid grid-cols-4 gap-1.5 xs:grid-cols-7">
                {[
                  { id: "FINAL", icon: Trophy, label: "Final" },
                  { id: "MIDTERM1", icon: FileCheck, label: "M1" },
                  { id: "MIDTERM2", icon: FileCheck, label: "M2" },
                  { id: "PROJECT", icon: GraduationCap, label: "Proj" },
                  { id: "HOMEWORK", icon: BookOpen, label: "HW" },
                  { id: "QUIZ", icon: ListTodo, label: "Quiz" },
                  { id: "REMINDER", icon: Bell, label: "Rem" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTaskType(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg border-2 transition-all",
                      taskType === cat.id 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    <span className="text-[8px] font-black uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class / Course</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full bg-background border-muted shadow-sm">
                  <SelectValue placeholder="Select course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General / No Course</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`edit-title-${task.id}`} className="text-sm font-semibold">Title</Label>
              <Input id={`edit-title-${task.id}`} name="title" defaultValue={task.title} maxLength={255} className="bg-background border-input focus:border-primary" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-description-${task.id}`} className="text-sm font-semibold">Description</Label>
              <Textarea 
                id={`edit-description-${task.id}`} 
                name="description" 
                defaultValue={task.description || ""} 
                className="bg-background border-input"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`edit-importance-${task.id}`} className="text-sm font-semibold">Points</Label>
                <Input id={`edit-importance-${task.id}`} name="importance" type="number" min={1} max={1000} defaultValue={task.importance} className="bg-background border-input" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-deadline-${task.id}`} className="text-sm font-semibold">Deadline</Label>
                <Input
                  id={`edit-deadline-${task.id}`}
                  name="deadline"
                  type="datetime-local"
                  defaultValue={task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""}
                  className="bg-background border-input"
                />
              </div>
            </div>
            {updateState && <p className="text-sm text-destructive font-medium">{updateState}</p>}
            <CardFooter className="p-0 pt-2 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)} className="w-full sm:w-auto font-semibold order-2 sm:order-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} size="sm" className="w-full sm:w-auto font-semibold order-1 sm:order-2">
                {isUpdating ? "Saving…" : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className={cn(
      isDragging ? "opacity-50 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:shadow-md hover:border-primary/40",
      localCompleted && "opacity-75 bg-muted/30 border-muted-foreground/20",
      "transition-all duration-300 group overflow-hidden border-border bg-card shadow-sm"
    )}>
      <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 pb-3 relative z-10">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 w-full min-w-0">
          <div className="flex flex-col gap-2 mt-1 shrink-0">
            {dragHandleProps ? (
              <button
                {...dragHandleProps}
                className="p-1.5 hover:bg-primary/10 rounded-md cursor-grab active:cursor-grabbing shrink-0 transition-colors bg-muted/50"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ) : (
              <div className="p-1.5 rounded-md shrink-0 bg-muted/50 opacity-50">
                <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
            )}
            <button 
              onClick={onToggleComplete}
              className="p-1.5 hover:bg-primary/10 rounded-md transition-colors shrink-0"
              title={localCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {localCompleted ? (
                <CheckCircle2 className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-green-500 fill-green-500/10" />
              ) : (
                <Circle className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <TypeIcon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", typeInfo.color)} />
              <button 
                onClick={() => setIsViewing(true)}
                className="text-left hover:text-primary transition-colors focus:outline-none"
              >
                <CardTitle className={cn(
                  "text-sm sm:text-base font-bold leading-tight truncate max-w-[150px] xs:max-w-none",
                  localCompleted && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </CardTitle>
              </button>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className={cn("text-[8px] sm:text-[9px] h-3.5 sm:h-4 uppercase font-black px-1 sm:px-1.5", typeInfo.bg, typeInfo.color, typeInfo.border)}>
                  {typeInfo.label}
                </Badge>
                {task.course && (
                  <Badge variant="secondary" className="text-[8px] sm:text-[9px] h-3.5 sm:h-4 bg-primary/10 text-primary border-none font-bold px-1 sm:px-1.5">
                    {task.course.name}
                  </Badge>
                )}
              </div>
            </div>
            {task.description && (
              <button 
                onClick={() => setIsViewing(true)}
                className="text-left hover:text-primary/80 transition-colors focus:outline-none group/desc"
              >
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 italic group-hover/desc:text-foreground/70 transition-colors">
                  {task.description}
                </p>
              </button>
            )}
            
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                {task.attachments.map((att) => (
                  <a 
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted/50 border border-border hover:bg-muted hover:border-primary/30 text-[9px] sm:text-[10px] font-medium transition-all group/att"
                    title={att.name}
                  >
                    <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground group-hover/att:text-primary" />
                    <span className="max-w-[70px] sm:max-w-[100px] truncate">{att.name}</span>
                    <ExternalLink className="h-2 w-2 sm:h-2.5 sm:w-2.5 opacity-0 group-hover/att:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Badge variant="outline" className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0 h-4.5 sm:h-5 border-primary/30 text-primary bg-primary/5 flex items-center gap-1">
                <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {task.importance} pts
              </Badge>
              <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4.5 sm:h-5 gap-1 sm:gap-1.5 bg-orange-50 text-orange-700 border-orange-100 font-bold px-1.5 sm:px-2">
                <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">{formatSeconds(actualTotalSeconds)} / {task.estimatedPomodoros * 25}m</span>
                <span className="xs:hidden">{formatSeconds(actualTotalSeconds)}</span>
              </Badge>
              {task.deadline && (
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 hidden xs:block" />
                  {formatDate(task.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto mt-1 sm:mt-0 justify-end">
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsViewing(true)} 
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground border-transparent"
            title="View full details"
          >
            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">View</span>
          </Button>
          {!localCompleted && (
            <Button 
              type="button" 
              variant={showTimer ? "default" : "secondary"}
              size="sm" 
              onClick={() => setShowTimer(!showTimer)} 
              className={cn(
                "h-7 sm:h-8 flex-1 sm:flex-none text-[10px] sm:text-xs font-bold transition-all border-transparent",
                showTimer ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-orange-500/10 hover:text-orange-600"
              )}
              title="Pomodoro Timer"
            >
              <Timer className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1", showTimer && "animate-pulse")} />
              {showTimer ? "Timer" : "Focus"}
            </Button>
          )}
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={handleDecompose} 
            disabled={isDecomposing}
            className="h-7 sm:h-8 flex-1 sm:flex-none text-[10px] sm:text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground border-transparent"
            title="Break down into smaller tasks"
          >
            <Split className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1", isDecomposing && "animate-spin")} />
            <span className="hidden sm:inline">{isDecomposing ? "..." : "Break Down"}</span>
            <span className="sm:hidden">{isDecomposing ? "..." : "Split"}</span>
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setEditing(true)} 
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground border-transparent"
          >
            Edit
          </Button>
          <form action={deleteAction} className="flex-none">
            <input type="hidden" name="id" value={task.id} />
            <Button 
              type="submit" 
              variant="destructive" 
              size="sm" 
              disabled={isDeleting} 
              className="h-7 sm:h-8 px-2.5 text-[10px] sm:text-xs font-bold transition-all border-transparent shadow-sm"
              title="Delete task"
            >
              {isDeleting ? (
                "…"
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        </div>
      </CardHeader>
      
      {(showTimer || (task.children && task.children.length > 0)) && (
        <CardContent className="pb-3 sm:pb-4 relative z-10 border-t bg-muted/5 mt-1 pt-3 sm:pt-4">
          {showTimer && (
            <div className="mb-3 sm:mb-4 animate-in zoom-in-95 duration-200">
              {(() => {
                const firstIncompleteChild = task.children?.find(c => !c.isCompleted);
                return (
                  <PomodoroTimer 
                    taskId={task.id} 
                    taskTitle={task.title} 
                    subTaskTitle={firstIncompleteChild?.title}
                    onTimeUpdate={async (seconds) => {
                      // Always update the sub-task if we're working on one
                      const targetId = firstIncompleteChild ? firstIncompleteChild.id : task.id;
                      await addTaskDuration(targetId, seconds);
                    }}
                    onSessionComplete={async (isDone) => {
                      if (!isDone) return;
                      
                      if (firstIncompleteChild) {
                        await toggleTaskCompletion(firstIncompleteChild.id, true);
                        toast.success(`Step "${firstIncompleteChild.title}" completed!`);
                      } else {
                        // Complete the main task if no children or all children are complete
                        await toggleTaskCompletion(task.id, true);
                        setShowTimer(false);
                      }
                    }}
                  />
                );
              })()}
            </div>
          )}

          {deleteState && <p className="text-[11px] sm:text-sm text-destructive mb-3 font-medium bg-destructive/10 p-2 rounded border border-destructive/20">{deleteState}</p>}

          {/* Nested Sub-tasks */}
          {task.children && task.children.length > 0 && (
            <div className="mt-0 pt-0 flex flex-col gap-1.5 sm:gap-2">
              <button 
                onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                className="flex items-center justify-between w-full hover:bg-primary/5 p-1 rounded transition-colors group/steps"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left">Actionable Steps</span>
                  <Badge variant="secondary" className="text-[7px] sm:text-[8px] h-3 sm:h-3.5 px-1 bg-primary/10 text-primary border-none">
                    {task.children.filter(c => c.isCompleted).length}/{task.children.length}
                  </Badge>
                </div>
                {isStepsExpanded ? (
                  <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground group-hover/steps:text-primary transition-colors" />
                ) : (
                  <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground group-hover/steps:text-primary transition-colors" />
                )}
              </button>
              
              {isStepsExpanded && (
                <div className="flex flex-col gap-1.5 sm:gap-2 ml-2 sm:ml-4 border-l-2 border-primary/10 pl-2 sm:pl-4 animate-in slide-in-from-top-1 duration-200">
                  {task.children.map((child) => {
                    const childSeconds = child.actualSeconds || 0;
                    return (
                      <div key={child.id} className={cn(
                        "flex flex-col gap-1 p-1.5 sm:p-2 rounded-lg transition-all group/sub",
                        child.isCompleted ? "bg-muted/50 opacity-75" : "bg-primary/5 border border-primary/10"
                      )}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <button 
                              onClick={() => onToggleSubTask(child.id, child.isCompleted)}
                              className="transition-transform active:scale-90 shrink-0"
                            >
                              {child.isCompleted ? (
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                              ) : (
                                <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-primary" />
                              )}
                            </button>
                            <span className={cn(
                              "text-[11px] sm:text-xs font-bold truncate",
                              child.isCompleted ? "line-through text-muted-foreground" : "text-foreground/90"
                            )}>{child.title}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground">{formatSeconds(childSeconds)}</span>
                            <Badge variant="outline" className="text-[7px] sm:text-[8px] h-3 sm:h-3.5 px-0.5 sm:px-1 bg-background font-bold uppercase border-primary/20">Step</Badge>
                          </div>
                        </div>
                        {child.attachments && child.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5 ml-4 sm:ml-5">
                            {child.attachments.map((att) => (
                              <a 
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[8px] sm:text-[9px] text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Paperclip className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span className="truncate max-w-[60px] sm:max-w-[80px]">{att.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>

    <Dialog open={isViewing} onOpenChange={setIsViewing}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 border-primary/20 shadow-2xl">
        <div className={cn("h-2 w-full", typeInfo.bg)} />
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-2 py-0.5", typeInfo.bg, typeInfo.color, typeInfo.border)}>
                {typeInfo.label}
              </Badge>
              {task.course && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none font-bold px-2 py-0.5">
                  {task.course.name}
                </Badge>
              )}
              {localCompleted && (
                <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 font-bold px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight mb-1">
              {task.title}
            </DialogTitle>
            <DialogDescription className="text-sm flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold text-foreground">{task.importance} Points</span>
              </span>
              {task.deadline && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Due {formatDate(task.deadline)}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Description Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Mission Briefing</h4>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap italic">
                  {task.description || "No detailed description provided for this task."}
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-500">
                  <Timer className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Focus Statistics</h4>
                </div>
                <div className="bg-orange-50/50 dark:bg-orange-950/10 rounded-xl p-4 border border-orange-200/50 flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-orange-600">{formatSeconds(actualTotalSeconds)}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Actual Focus</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-orange-200/30 pt-1 mt-1">
                    <span className="text-sm font-bold text-foreground/70">{task.estimatedPomodoros * 25}m</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Timeline</h4>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-muted-foreground uppercase">Created</span>
                    <span className="font-medium">{formatDate(task.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-muted-foreground uppercase">Last Update</span>
                    <span className="font-medium">{formatDate(task.updatedAt)}</span>
                  </div>
                  {task.completedAt && (
                    <div className="flex justify-between items-center text-[10px] text-green-600">
                      <span className="font-bold uppercase">Archived</span>
                      <span className="font-medium">{formatDate(task.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-500">
                  <Paperclip className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Intelligence Assets ({task.attachments.length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.attachments.map((att) => (
                    <a 
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group/asset"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-muted p-2 rounded-lg group-hover/asset:bg-primary/10 transition-colors">
                          <FileText className="h-4 w-4 text-muted-foreground group-hover/asset:text-primary" />
                        </div>
                        <span className="text-xs font-bold truncate max-w-[150px]">{att.name}</span>
                      </div>
                      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/asset:opacity-100 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tasks Detailed Section */}
            {task.children && task.children.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Actionable Roadmap</h4>
                </div>
                <div className="space-y-2">
                  {task.children.map((child) => (
                    <div 
                      key={child.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                        child.isCompleted 
                          ? "bg-muted/30 border-muted-foreground/10 opacity-60" 
                          : "bg-primary/5 border-primary/10 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1 rounded-full",
                          child.isCompleted ? "bg-green-500/10" : "bg-primary/10"
                        )}>
                          {child.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          child.isCompleted && "line-through"
                        )}>{child.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black tracking-tighter tabular-nums px-1.5">
                          {formatSeconds(child.actualSeconds || 0)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-muted/20">
          <Button variant="outline" onClick={() => setIsViewing(false)} className="font-bold">
            Dismiss Briefing
          </Button>
          <Button 
            onClick={() => { setIsViewing(false); setEditing(true); }}
            className="font-bold shadow-lg shadow-primary/20"
          >
            Edit Mission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function SortableTaskItem({ task, setTasks }: { task: TaskWithAttachments; setTasks: React.Dispatch<React.SetStateAction<TaskWithAttachments[] | null>> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <TaskItem 
        task={task} 
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        setTasks={setTasks}
      />
    </li>
  );
}

function TaskListContent({ 
  tasks, 
  setTasks,
  isSorting,
  handleDragEnd,
  sensors
}: { 
  tasks: TaskWithAttachments[];
  setTasks: React.Dispatch<React.SetStateAction<TaskWithAttachments[] | null>>;
  isSorting: boolean;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: any;
}) {
  const mounted = useMounted();

  if (tasks.length === 0) {
    return <p className="text-muted-foreground text-sm">No tasks yet. Add one above.</p>;
  }

  if (!mounted) {
    return (
      <div className="transition-all duration-500">
        <ul className="flex flex-col gap-3 list-none p-0 m-0">
          {tasks.map((task) => (
            <li key={task.id} className="list-none">
              <TaskItem task={task} setTasks={setTasks} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn(
      "transition-all duration-500",
      isSorting && "opacity-40 blur-[1px] pointer-events-none scale-[0.98]"
    )}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {tasks.map((task) => (
              <SortableTaskItem key={task.id} task={task} setTasks={setTasks} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex flex-col gap-2 mt-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function TaskList({ initialTasksPromise }: { initialTasksPromise: Promise<ActionResult<TaskWithAttachments[]>> }) {
  const [tasks, setTasks] = useState<TaskWithAttachments[] | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Load initial tasks without blocking UI re-renders later
  useEffect(() => {
    initialTasksPromise.then(result => {
      if (result.success) setTasks(result.data);
    });
  }, [initialTasksPromise]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleShuffle() {
    if (!tasks) return;
    
    setIsShuffling(true);
    const shuffledTasks = [...tasks].sort(() => Math.random() - 0.5);

    setTasks(shuffledTasks);

    const taskPositions = shuffledTasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));

    await updateTaskOrder(taskPositions);
    setIsShuffling(false);
  }

  async function handleDeleteAll() {
    setIsDeletingAll(true);
    const result = await deleteAllTasks();
    if (result.success) {
      setTasks([]);
      toast.success("All tasks deleted successfully");
    } else {
      toast.error(result.error);
    }
    setIsDeletingAll(false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!tasks) return;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      const taskPositions = newTasks.map((task, index) => ({
        id: task.id,
        position: index,
      }));

      await updateTaskOrder(taskPositions);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AIOptimizationEngine 
        tasksPromise={initialTasksPromise} 
        onOptimized={(optimizedTasks) => setTasks(optimizedTasks)} 
      />

      <TaskListHeader 
        tasksPromise={initialTasksPromise}
        onShuffle={handleShuffle}
        onDeleteAll={handleDeleteAll}
        isShuffling={isShuffling}
        isDeletingAll={isDeletingAll}
      />

      {tasks ? (
        <TaskListContent 
          tasks={tasks}
          setTasks={setTasks}
          isSorting={isSorting}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
        />
      ) : (
        <TaskListSkeleton />
      )}
    </div>
  );
}
