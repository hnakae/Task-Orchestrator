"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TaskWithAttachments } from "../actions";
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

interface TaskListHeaderProps {
  initialTasks: TaskWithAttachments[];
  onShuffle: () => void;
  onDeleteAll: () => void;
  isShuffling?: boolean;
  isDeletingAll?: boolean;
}

export function TaskListHeader({ initialTasks, onShuffle, onDeleteAll, isShuffling, isDeletingAll }: TaskListHeaderProps) {
  const rate = initialTasks.length > 0 
    ? Math.round((initialTasks.filter(t => t.isCompleted).length / initialTasks.length) * 100)
    : 0;

  return (
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Your Tasks
          <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 min-w-[1.25rem] flex items-center justify-center text-[10px]">
            {initialTasks.length}
          </Badge>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Completion:</span>
            <span className={cn(
              "text-[11px] font-black",
              rate >= 80 ? "text-green-600" :
              rate >= 50 ? "text-yellow-600" :
              "text-red-600"
            )}>
              {rate}%
            </span>
          </div>
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onShuffle}
          disabled={isShuffling}
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
              disabled={isDeletingAll}
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
              <AlertDialogAction onClick={onDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
