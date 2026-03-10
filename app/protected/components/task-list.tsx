"use client";

import { useActionState, useState, useMemo, useEffect } from "react";
import type { Task } from "@/lib/generated/prisma/client";
import { updateTask, deleteTask, updateTaskOrder } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { GripVertical, Sparkles } from "lucide-react";

function formatDate(date: Date | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: d.getHours() || d.getMinutes() ? "short" : undefined,
  });
}

function TaskItem({ 
  task, 
  dragHandleProps, 
  isDragging 
}: { 
  task: Task; 
  dragHandleProps?: any;
  isDragging?: boolean;
}) {
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
      <Card className={isDragging ? "opacity-50" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Edit task</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <form action={updateAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={task.id} />
            <div className="grid gap-2">
              <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
              <Input id={`edit-title-${task.id}`} name="title" defaultValue={task.title} maxLength={255} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor={`edit-importance-${task.id}`}>Importance</Label>
                <Input id={`edit-importance-${task.id}`} name="importance" type="number" min={1} max={10} defaultValue={task.importance} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-weight-${task.id}`}>Weight</Label>
                <Input id={`edit-weight-${task.id}`} name="weight" type="number" min={1} max={10} defaultValue={task.weight} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-deadline-${task.id}`}>Deadline</Label>
              <Input
                id={`edit-deadline-${task.id}`}
                name="deadline"
                type="datetime-local"
                defaultValue={task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""}
              />
            </div>
            {updateState && <p className="text-sm text-destructive">{updateState}</p>}
            <CardFooter className="p-0 flex gap-2">
              <Button type="submit" disabled={isUpdating} size="sm">
                {isUpdating ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isDragging ? "opacity-50 border-primary" : ""}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="mt-1 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing shrink-0"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{task.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] h-5">
                Score: {task.importance * task.weight}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={task.id} />
            <Button type="submit" variant="destructive" size="sm" disabled={isDeleting}>
              {isDeleting ? "…" : "Delete"}
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <dl className="text-sm text-muted-foreground grid grid-cols-2 gap-1 ml-7">
          <dt>Importance</dt><dd>{task.importance}</dd>
          <dt>Weight</dt><dd>{task.weight}</dd>
          <dt>Deadline</dt><dd>{formatDate(task.deadline)}</dd>
        </dl>
        {deleteState && <p className="text-sm text-destructive mt-2">{deleteState}</p>}
      </CardContent>
    </Card>
  );
}

function SortableTaskItem({ task }: { task: Task }) {
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

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isSorting, setIsSorting] = useState(false);

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
    const sortedTasks = [...tasks].sort((a, b) => {
      const scoreA = a.importance * a.weight;
      const scoreB = b.importance * b.weight;
      return scoreB - scoreA;
    });
    
    setTasks(sortedTasks);

    // Update positions in background
    const taskPositions = sortedTasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));
    
    await updateTaskOrder(taskPositions);
    setIsSorting(false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      // Update positions in background
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Tasks</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSortByFocusScore}
          disabled={isSorting}
          className="relative overflow-hidden group border-primary/20 hover:border-primary/50 transition-all duration-300 bg-gradient-to-r from-background to-muted hover:to-primary/5 px-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {isSorting ? "Sorting..." : "AI Optimize Focus"}
            </span>
          </div>
        </Button>
      </div>

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
  );
}