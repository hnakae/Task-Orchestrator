"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAIOptimizedFocus, updateTaskOrder, type TaskWithAttachments } from "../actions";

interface AIOptimizationEngineProps {
  initialTasks: TaskWithAttachments[];
  onOptimized: (optimizedTasks: TaskWithAttachments[], recommendation: string) => void;
}

export function AIOptimizationEngine({ initialTasks, onOptimized }: AIOptimizationEngineProps) {
  const [isSorting, setIsSorting] = useState(false);
  const [aiRecommendation, setAIRecommendation] = useState<string | null>(null);

  async function handleSortByFocusScore() {
    setIsSorting(true);
    setAIRecommendation(null);

    try {
      const optimizationResult = await getAIOptimizedFocus(initialTasks);

      if (optimizationResult.success) {
        setAIRecommendation(optimizationResult.data.recommendation);
        
        const optimizedTasks = optimizationResult.data.optimizedIds
          .map(id => initialTasks.find(t => t.id === id))
          .filter((t): t is TaskWithAttachments => !!t);

        if (optimizedTasks.length === initialTasks.length) {
          onOptimized(optimizedTasks, optimizationResult.data.recommendation);
          
          const taskPositions = optimizedTasks.map((task, index) => ({
            id: task.id,
            position: index,
          }));

          await updateTaskOrder(taskPositions);
        }
      } else {
        toast.error(optimizationResult.error);
      }
    } catch {
      toast.error("Failed to optimize tasks");
    } finally {
      setIsSorting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
          disabled={isSorting}
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
            <p className="text-sm text-foreground/90 font-medium italic">&quot;{aiRecommendation}&quot;</p>
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
    </div>
  );
}
