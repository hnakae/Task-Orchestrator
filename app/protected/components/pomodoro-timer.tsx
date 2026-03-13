"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Zap, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  taskId: string;
  taskTitle: string;
  subTaskTitle?: string;
  onSessionComplete: (isDone: boolean) => void;
  onTimeUpdate?: (seconds: number) => void;
  autoStart?: boolean;
}

type TimerMode = "WORK" | "BREAK" | "PROMPT";

export function PomodoroTimer({ taskId, taskTitle, subTaskTitle, onSessionComplete, onTimeUpdate, autoStart = false }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(autoStart);
  const [mode, setMode] = useState<TimerMode>("WORK");
  const [sessionCount, setSessionCount] = useState(0);
  const workSecondsRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.warn("Audio play blocked", e));
    }
  }, []);

  const reportTimeSpent = useCallback(() => {
    if (workSecondsRef.current > 0 && onTimeUpdate) {
      onTimeUpdate(workSecondsRef.current);
      workSecondsRef.current = 0;
    }
  }, [onTimeUpdate]);

  const handleFinishWork = useCallback(() => {
    playSound();
    setIsActive(false);
    reportTimeSpent(); // Report any pending seconds
    setMode("PROMPT");
  }, [playSound, reportTimeSpent]);

  const handlePromptResponse = (isDone: boolean) => {
    if (isDone) {
      // Move to break
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      const breakTime = newSessionCount % 2 === 0 ? 15 * 60 : 5 * 60;
      
      setMode("BREAK");
      setTimeLeft(breakTime);
      setIsActive(true); // Auto-start break
      onSessionComplete(true); // Signal completion of the subtask
      toast(`Step complete! Time for a ${breakTime / 60} minute break!`, { icon: <Coffee className="h-4 w-4" /> });
    } else {
      // Repeat work session
      setMode("WORK");
      setTimeLeft(25 * 60);
      setIsActive(true); // Auto-start next session
      onSessionComplete(false); // Signal not done, repeat
      toast("Continuing focus...", { icon: <Zap className="h-4 w-4" /> });
    }
  };

  const skipBreak = () => {
    setMode("WORK");
    setTimeLeft(25 * 60);
    setIsActive(true);
    toast("Break skipped. Back to work!", { icon: <Zap className="h-4 w-4" /> });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === "WORK") {
          // Only track actual focus time, excluding breaks
          workSecondsRef.current += 1;
          // Auto-report every 30 seconds to keep DB synced without too many requests
          if (workSecondsRef.current >= 30) {
            reportTimeSpent();
          }
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (mode === "WORK") {
        handleFinishWork();
      } else if (mode === "BREAK") {
        playSound();
        setMode("WORK");
        setTimeLeft(25 * 60);
        setIsActive(true);
        toast("Break over! Back to work.", { icon: <Zap className="h-4 w-4" /> });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, handleFinishWork, playSound, reportTimeSpent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (mode === "PROMPT") {
    return (
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in zoom-in-95 duration-200 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Session Finished</span>
            <h4 className="text-sm font-bold text-foreground">Is "{subTaskTitle || taskTitle}" completed yet?</h4>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            className="flex-1 font-bold h-10 gap-2 shadow-sm"
            onClick={() => handlePromptResponse(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Yes, finished!
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 font-bold h-10 gap-2 border-primary/20 hover:bg-primary/5"
            onClick={() => handlePromptResponse(false)}
          >
            <RotateCcw className="h-4 w-4" />
            No, need more time
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-3 p-4 rounded-xl border transition-all duration-500 shadow-sm",
      mode === "WORK" 
        ? "bg-orange-50/50 border-orange-200 dark:bg-orange-950/10 dark:border-orange-900/30 shadow-orange-100/50" 
        : "bg-green-50/50 border-green-200 dark:bg-green-950/10 dark:border-green-900/30 shadow-green-100/50"
    )}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "WORK" ? (
              <div className="relative">
                <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
                <Zap className="h-4 w-4 text-orange-500 absolute inset-0 animate-ping opacity-20" />
              </div>
            ) : (
              <Coffee className="h-4 w-4 text-green-500" />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {mode === "WORK" ? "Currently Focusing On" : "Recovery Phase"}
            </span>
          </div>
          <div className="text-2xl font-mono font-black tabular-nums tracking-tighter text-foreground">
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="px-1 truncate">
          <p className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
            <ArrowRight className="h-3 w-3 text-primary/60" />
            {subTaskTitle || taskTitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Button 
          variant={mode === "WORK" ? "default" : "secondary"} 
          size="sm" 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "flex-1 h-9 gap-2 font-bold transition-all shadow-sm",
            mode === "WORK" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"
          )}
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isActive ? "Pause" : "Start"}
        </Button>
        {mode === "WORK" ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFinishWork}
            className="h-9 px-3 gap-2 border-orange-200 hover:bg-orange-100 hover:text-orange-700 text-orange-600 font-bold shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finish
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={skipBreak}
            className="h-9 px-3 gap-2 border-green-200 hover:bg-green-100 hover:text-green-700 text-green-600 font-bold shadow-sm"
          >
            <Zap className="h-4 w-4" />
            Skip
          </Button>
        )}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => { setIsActive(false); setTimeLeft(mode === "WORK" ? 25 * 60 : 5 * 60); }} 
          className="h-9 w-9 border-muted hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {sessionCount > 0 && (
        <div className="flex items-center gap-1 mt-1 border-t border-border/50 pt-2">
          {Array.from({ length: sessionCount }).map((_, i) => (
            <CheckCircle2 key={i} className="h-3 w-3 text-primary/60" />
          ))}
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            {sessionCount} step{sessionCount > 1 ? 's' : ''} cleared
          </span>
        </div>
      )}
    </div>
  );
}
