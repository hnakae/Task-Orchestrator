"use client";

import { useActionState, useState, useMemo, useEffect } from "react";
import { 
  updateTask, 
  deleteTask, 
  updateTaskOrder, 
  getAIOptimizedFocus, 
  deleteAllTasks, 
  decomposeTask, 
  toggleTaskCompletion, 
  getCourses,
  TaskWithAttachments 
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  Shuffle, 
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
  ArrowRight
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { PomodoroTimer } from "./pomodoro-timer";

function formatDate(date: Date | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
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

function TaskItem({ 
  task, 
  dragHandleProps, 
  isDragging 
}: { 
  task: TaskWithAttachments; 
  dragHandleProps?: any;
  isDragging?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isStepsExpanded, setIsStepsExpanded] = useState(true);
  const [taskType, setTaskType] = useState<string>(task.type);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(task.courseId || "none");
  
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
    const newStatus = !task.isCompleted;
    const result = await toggleTaskCompletion(task.id, newStatus);
    if (!result.success) {
      toast.error(result.error);
    }
  }

  useEffect(() => {
    if (task.isCompleted) {
      setShowTimer(false);
      setIsStepsExpanded(false);
    }
  }, [task.isCompleted]);

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
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
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
            <div className="grid grid-cols-2 gap-4">
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
            <CardFooter className="p-0 pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)} className="font-semibold">
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} size="sm" className="font-semibold">
                {isUpdating ? "Saving…" : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      isDragging ? "opacity-50 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:shadow-md hover:border-primary/40",
      task.isCompleted && "opacity-75 bg-muted/30 border-muted-foreground/20",
      "transition-all duration-300 group overflow-hidden border-border bg-card shadow-sm"
    )}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 relative z-10">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex flex-col gap-2 mt-1">
            {dragHandleProps && (
              <button
                {...dragHandleProps}
                className="p-1.5 hover:bg-primary/10 rounded-md cursor-grab active:cursor-grabbing shrink-0 transition-colors bg-muted/50"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            )}
            <button 
              onClick={onToggleComplete}
              className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
              title={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500/10" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <TypeIcon className={cn("h-3.5 w-3.5", typeInfo.color)} />
              <CardTitle className={cn(
                "text-base font-bold leading-tight truncate transition-colors",
                task.isCompleted && "line-through text-muted-foreground",
                !task.isCompleted && "group-hover:text-primary"
              )}>
                {task.title}
              </CardTitle>
              <Badge variant="outline" className={cn("text-[9px] h-4 uppercase font-black px-1.5", typeInfo.bg, typeInfo.color, typeInfo.border)}>
                {typeInfo.label}
              </Badge>
              {task.course && (
                <Badge variant="secondary" className="text-[9px] h-4 bg-primary/10 text-primary border-none font-bold">
                  {task.course.name}
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 italic">
                {task.description}
              </p>
            )}
            
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {task.attachments.map((att) => (
                  <a 
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted hover:border-primary/30 text-[10px] font-medium transition-all group/att"
                    title={att.name}
                  >
                    <FileText className="h-3 w-3 text-muted-foreground group-hover/att:text-primary" />
                    <span className="max-w-[100px] truncate">{att.name}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/att:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[11px] font-bold px-2 py-0.5 border-primary/30 text-primary bg-primary/5 flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {task.importance} pts
              </Badge>
              {task.deadline && (
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  {formatDate(task.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            type="button" 
            variant={showTimer ? "default" : "secondary"}
            size="sm" 
            onClick={() => setShowTimer(!showTimer)} 
            className={cn(
              "h-8 text-xs font-bold transition-all border-transparent",
              showTimer ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-orange-500/10 hover:text-orange-600"
            )}
            title="Pomodoro Timer"
          >
            <Timer className={cn("h-3.5 w-3.5 mr-1", showTimer && "animate-pulse")} />
            {showTimer ? "Timer Open" : "Focus"}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={handleDecompose} 
            disabled={isDecomposing}
            className="h-8 text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground border-transparent"
            title="Break down into smaller tasks"
          >
            <Split className={cn("h-3.5 w-3.5 mr-1", isDecomposing && "animate-spin")} />
            {isDecomposing ? "..." : "Break Down"}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setEditing(true)} 
            className="h-8 text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground border-transparent"
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
              className="h-8 text-xs font-bold transition-all border-transparent shadow-sm"
            >
              {isDeleting ? "…" : "Delete"}
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="pb-4 relative z-10 border-t bg-muted/5 mt-1 pt-4">
        {showTimer && (
          <div className="mb-4 animate-in zoom-in-95 duration-200">
            {(() => {
              const firstIncompleteChild = task.children?.find(c => !c.isCompleted);
              return (
                <PomodoroTimer 
                  taskId={task.id} 
                  taskTitle={task.title} 
                  subTaskTitle={firstIncompleteChild?.title}
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

        {deleteState && <p className="text-sm text-destructive mb-3 font-medium bg-destructive/10 p-2 rounded border border-destructive/20">{deleteState}</p>}

        {/* Nested Sub-tasks */}
        {task.children && task.children.length > 0 && (
          <div className="mt-0 pt-0 flex flex-col gap-2">
            <button 
              onClick={() => setIsStepsExpanded(!isStepsExpanded)}
              className="flex items-center justify-between w-full hover:bg-primary/5 p-1 rounded transition-colors group/steps"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actionable Steps</span>
                <Badge variant="secondary" className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-none">
                  {task.children.filter(c => c.isCompleted).length}/{task.children.length}
                </Badge>
              </div>
              {isStepsExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/steps:text-primary transition-colors" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/steps:text-primary transition-colors" />
              )}
            </button>
            
            {isStepsExpanded && (
              <div className="flex flex-col gap-2 ml-4 border-l-2 border-primary/10 pl-4 animate-in slide-in-from-top-1 duration-200">
                {task.children.map((child) => (
                  <div key={child.id} className={cn(
                    "flex flex-col gap-1 p-2 rounded-lg transition-all group/sub",
                    child.isCompleted ? "bg-muted/50 opacity-75" : "bg-primary/5 border border-primary/10"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            const res = await toggleTaskCompletion(child.id, !child.isCompleted);
                            if (!res.success) toast.error(res.error);
                          }}
                          className="transition-transform active:scale-90"
                        >
                          {child.isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        <span className={cn(
                          "text-xs font-bold",
                          child.isCompleted ? "line-through text-muted-foreground" : "text-foreground/90"
                        )}>{child.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-background font-bold uppercase border-primary/20">Step</Badge>
                    </div>
                    {child.attachments && child.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 ml-5">
                        {child.attachments.map((att) => (
                          <a 
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Paperclip className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[80px]">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SortableTaskItem({ task }: { task: TaskWithAttachments }) {
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
      />
    </li>
  );
}

export function TaskList({ initialTasks }: { initialTasks: TaskWithAttachments[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isSorting, setIsSorting] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [aiRecommendation, setAIRecommendation] = useState<string | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleSortByFocusScore() {
    setIsSorting(true);
    setAIRecommendation(null);

    const result = await getAIOptimizedFocus(tasks);

    if (result.success) {
      setAIRecommendation(result.data.recommendation);

      const optimizedTasks = result.data.optimizedIds
        .map(id => tasks.find(t => t.id === id))
        .filter((t): t is TaskWithAttachments => !!t);

      if (optimizedTasks.length === tasks.length) {
        setTasks(optimizedTasks);

        const taskPositions = optimizedTasks.map((task, index) => ({
          id: task.id,
          position: index,
        }));

        await updateTaskOrder(taskPositions);
      }
    } else {
      toast.error(result.error);
    }

    setIsSorting(false);
  }

  async function handleShuffle() {
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
      toast.success("All tasks deleted successfully");
    } else {
      toast.error(result.error);
    }
    setIsDeletingAll(false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

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

  if (initialTasks.length === 0) {
    return <p className="text-muted-foreground text-sm">No tasks yet. Add one above.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* AI Center Stage Button */}
      <div className="flex flex-col items-center gap-4 py-4 bg-muted/20 rounded-2xl border border-dashed border-primary/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />

        <div className="flex flex-col items-center gap-1 relative z-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Optimization Engine</span>
          <h3 className="text-sm font-medium text-muted-foreground">Let AI determine your most impactful flow</h3>
        </div>

        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleSortByFocusScore}
          disabled={isSorting || isShuffling}
          className={cn(
            "relative h-14 px-8 rounded-full border-primary/20 hover:border-primary/50 transition-all duration-500 bg-background shadow-xl hover:shadow-primary/10 overflow-hidden group w-full max-w-xs",
            isSorting && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            isSorting && "opacity-100 animate-pulse"
          )} />

          <div className="relative flex items-center justify-center gap-3">
            <div className="relative">
              <Sparkles className={cn(
                "h-5 w-5 text-primary transition-all duration-700",
                isSorting ? "animate-spin scale-125" : "animate-pulse group-hover:scale-110"
              )} />
              {isSorting && (
                <Sparkles className="h-5 w-5 text-primary absolute inset-0 animate-ping opacity-50" />
              )}
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              {isSorting ? "AI is thinking..." : "AI Optimize Focus"}
            </span>
          </div>
        </Button>
      </div>

      {aiRecommendation && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-500">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Recommendation</span>
            <p className="text-sm text-foreground/90 font-medium italic">"{aiRecommendation}"</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-6 w-6 text-muted-foreground hover:bg-primary/10" 
            onClick={() => setAIRecommendation(null)}
          >
            <span className="sr-only">Dismiss</span>
            <span aria-hidden>×</span>
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Your Tasks
          <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 min-w-[1.25rem] flex items-center justify-center text-[10px]">
            {tasks.length}
          </Badge>
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShuffle}
            disabled={isShuffling || isSorting}
            className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium"
          >
            <Shuffle className={cn("h-3 w-3 mr-1.5", isShuffling && "animate-spin")} />
            {isShuffling ? "Shuffling..." : "Shuffle"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={isDeletingAll || isSorting || isShuffling}
                className="text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                {isDeletingAll ? "Deleting..." : "Delete All"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all of your
                  tasks from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

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
                <SortableTaskItem key={task.id} task={task} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
