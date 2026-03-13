"use client";

import { useActionState, useState, useEffect, useMemo } from "react";
import { createTask, getCourses, createCourse, updateCourse } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  ListTodo,
  Paperclip, 
  X, 
  FileText, 
  Plus, 
  GraduationCap, 
  Trophy, 
  FileCheck, 
  Bell, 
  PlusCircle,
  Trash2
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "./ui/dialog";

type TaskType = string;

const DEFAULT_CATEGORIES = [
  { id: "HOMEWORK", icon: BookOpen, label: "Homework" },
  { id: "QUIZ", icon: ListTodo, label: "Quiz" },
  { id: "EXAM", icon: Trophy, label: "Exam" },
  { id: "PROJECT", icon: GraduationCap, label: "Project" },
  { id: "REMINDER", icon: Bell, label: "Reminder" },
];

export function TaskCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [taskType, setTaskType] = useState<TaskType>("HOMEWORK");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(100);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("none");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [rubricItems, setRubricItems] = useState([
    { id: "HOMEWORK", label: "Homework", weight: 20 },
    { id: "QUIZ", label: "Quizzes", weight: 10 },
    { id: "MIDTERM1", label: "Midterm 1", weight: 15 },
    { id: "MIDTERM2", label: "Midterm 2", weight: 15 },
    { id: "FINAL", label: "Final Exam", weight: 25 },
    { id: "PROJECT", label: "Project", weight: 15 },
  ]);
  const [files, setFiles] = useState<File[]>([]);

  const totalWeight = rubricItems.reduce((a, b) => a + b.weight, 0);

  useEffect(() => {
    async function loadCourses() {
      const res = await getCourses();
      if (res.success) setCourses(res.data);
    }
    loadCourses();
  }, []);

  const currentCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const availableCategories = useMemo(() => {
    if (!currentCourse || !currentCourse.rubric) {
      return DEFAULT_CATEGORIES;
    }
    
    const rubric = currentCourse.rubric as Record<string, number>;
    return Object.entries(rubric).map(([id, weight]) => {
      // Map common IDs to icons
      let icon = FileText;
      if (id.includes("HOMEWORK")) icon = BookOpen;
      else if (id.includes("QUIZ")) icon = ListTodo;
      else if (id.includes("EXAM") || id.includes("FINAL") || id.includes("MIDTERM")) icon = Trophy;
      else if (id.includes("PROJECT")) icon = GraduationCap;
      else if (id.includes("REMINDER")) icon = Bell;

      // Format label: "HOMEWORK" -> "Homework"
      const label = id.charAt(0) + id.slice(1).toLowerCase().replace(/_/g, " ");
      
      return { id, icon, label };
    });
  }, [currentCourse]);

  // Reset task type when categories change
  useEffect(() => {
    if (availableCategories.length > 0) {
      if (!availableCategories.find(c => c.id === taskType)) {
        setTaskType(availableCategories[0].id);
      }
    }
  }, [availableCategories, taskType]);

  const getCategoryDefaults = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("final")) return { title: "Final Exam", desc: "Final examination details...", points: 100, pomodoros: 8 };
    if (lowerType.includes("midterm")) return { title: "Midterm Exam", desc: "Midterm assessment details...", points: 60, pomodoros: 4 };
    if (lowerType.includes("quiz")) return { title: "Quiz 1", desc: "Quick check details...", points: 20, pomodoros: 1 };
    if (lowerType.includes("project")) return { title: "Major Project", desc: "Project deliverables...", points: 100, pomodoros: 12 };
    if (lowerType.includes("homework")) return { title: "Homework 1", desc: "Assignment details...", points: 20, pomodoros: 2 };
    if (lowerType.includes("reminder")) return { title: "Study Session", desc: "Review details...", points: 0, pomodoros: 1 };
    
    return { title: `${type} 1`, desc: "Enter details...", points: 100, pomodoros: 2 };
  };

  // Auto-fill when task type changes
  useEffect(() => {
    const defaults = getCategoryDefaults(taskType);
    setTitle(defaults.title);
    setDescription(defaults.desc);
    setPoints(defaults.points);
    setEstimatedPomodoros(defaults.pomodoros);
  }, [taskType]);

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      formData.delete("attachments");
      files.forEach(file => {
        formData.append("attachments", file);
      });

      if (selectedCourseId !== "none") {
        formData.append("courseId", selectedCourseId);
      }

      formData.set("type", taskType);
      formData.set("importance", points.toString());
      formData.set("estimatedPomodoros", estimatedPomodoros.toString());

      const result = await createTask(formData);
      if (result.success) {
        onSuccess?.();
        toast.success("Task created successfully!");
        return null;
      }
      return result.error;
    },
    null
  );

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }
    if (totalWeight !== 100) {
      toast.error(`Total weight must be exactly 100% (currently ${totalWeight}%)`);
      return;
    }

    // Convert array back to map for the database
    const rubricMap: Record<string, number> = {};
    rubricItems.forEach(item => {
      // Use label as ID if it's a custom item, otherwise keep original ID
      const id = item.id.startsWith("SECTION_") 
        ? item.label.toUpperCase().replace(/\s+/g, "_") 
        : item.id;
      rubricMap[id] = item.weight;
    });

    const res = await createCourse(newCourseName, rubricMap);
    if (res.success) {
      setCourses(prev => [...prev, res.data]);
      setSelectedCourseId(res.data.id);
      setNewCourseName("");
      // Reset items
      setRubricItems([
        { id: "HOMEWORK", label: "Homework", weight: 20 },
        { id: "QUIZ", label: "Quizzes", weight: 10 },
        { id: "MIDTERM1", label: "Midterm 1", weight: 15 },
        { id: "MIDTERM2", label: "Midterm 2", weight: 15 },
        { id: "FINAL", label: "Final Exam", weight: 25 },
        { id: "PROJECT", label: "Project", weight: 15 },
      ]);
      setIsAddingCourse(false);
      toast.success("Course added with custom rubric!");
    } else {
      toast.error(res.error);
    }
  };

  const addRubricSection = () => {
    const newId = `SECTION_${Date.now()}`;
    setRubricItems([...rubricItems, { id: newId, label: "New Section", weight: 0 }]);
  };

  const updateRubricItem = (index: number, field: "label" | "weight", value: string | number) => {
    const newItems = [...rubricItems];
    if (field === "label") {
      newItems[index].label = value as string;
    } else {
      newItems[index].weight = Number(value);
    }
    setRubricItems(newItems);
  };

  const deleteRubricItem = (index: number) => {
    setRubricItems(rubricItems.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
  const defaultDeadline = tomorrow.toISOString().slice(0, 16);

  return (
    <form action={formAction} className="flex flex-col gap-4 overflow-y-auto max-h-[85vh] px-1">
      {/* Course Selection */}
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="course-select" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class / Course</Label>
          <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
            <DialogTrigger asChild>
              <button type="button" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                <PlusCircle className="h-3 w-3" />
                Add Course
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Create a new course and define its grading rubric.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                  <Label htmlFor="new-course-name" className="text-xs font-bold uppercase">Course Name</Label>
                  <Input 
                    id="new-course-name" 
                    placeholder="e.g. CS101: Introduction to AI" 
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                  />
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Label id="rubric-label" className="text-xs font-bold uppercase text-primary">Grading Rubric (%)</Label>
                      <button 
                        type="button" 
                        onClick={addRubricSection}
                        className="text-primary hover:text-primary/80"
                        aria-labelledby="rubric-label"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <Badge variant={totalWeight === 100 ? "default" : "destructive"} className="text-[10px]">
                      Total: {totalWeight}%
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3" role="group" aria-labelledby="rubric-label">
                    {rubricItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Input
                          id={`rubric-label-${item.id}`}
                          aria-label={`Rubric item ${index + 1} name`}
                          className="h-8 text-[11px] font-medium flex-1"
                          value={item.label}
                          onChange={(e) => updateRubricItem(index, "label", e.target.value)}
                          placeholder="Section Name"
                        />
                        <div className="flex items-center gap-2 w-20">
                          <Input
                            id={`rubric-weight-${item.id}`}
                            aria-label={`Rubric item ${index + 1} weight percentage`}
                            type="number"
                            min={0}
                            max={100}
                            className="h-8 text-right pr-2 text-[11px]"
                            value={item.weight}
                            onChange={(e) => updateRubricItem(index, "weight", Number(e.target.value))}
                          />
                          <span className="text-[10px] text-muted-foreground">%</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteRubricItem(index)}
                          aria-label={`Delete rubric item ${item.label}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {totalWeight !== 100 && (
                    <p className="text-[10px] text-destructive mt-3 font-medium italic">
                      * Weights must add up to exactly 100% to continue.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddingCourse(false)}>Cancel</Button>
                <Button type="button" onClick={handleAddCourse} disabled={totalWeight !== 100}>Add Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger id="course-select" className="w-full bg-background border-muted shadow-sm h-9">
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

      {/* Category Selection */}
      <div className="flex flex-col gap-2">
        <Label id="academic-category-label" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Academic Category</Label>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-7" role="radiogroup" aria-labelledby="academic-category-label">
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setTaskType(cat.id)}
              aria-pressed={taskType === cat.id}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg border-2 transition-all group",
                taskType === cat.id 
                  ? "border-primary bg-primary/5 text-primary shadow-sm" 
                  : "border-muted bg-background hover:border-primary/20 text-muted-foreground"
              )}
            >
              <cat.icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", taskType === cat.id && "animate-pulse")} />
              <span className="text-[8px] font-black uppercase tracking-tight text-center leading-tight line-clamp-1 w-full">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Task Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
          className="bg-background border-muted h-9"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details & Context</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none bg-background border-muted min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="importance" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Points Value</Label>
            <div className="relative">
              <Input
                id="importance"
                name="importance"
                type="number"
                min={0}
                max={1000}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="pl-8 h-9"
              />
              <Trophy className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="estimatedPomodoros" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Est. Pomodoros</Label>
            <div className="relative">
              <Input
                id="estimatedPomodoros"
                name="estimatedPomodoros"
                type="number"
                min={1}
                max={100}
                value={estimatedPomodoros}
                onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
                className="pl-8 h-9"
              />
              <Bell className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="deadline" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date</Label>
          <Input 
            id="deadline" 
            name="deadline" 
            type="datetime-local" 
            defaultValue={defaultDeadline}
            className="bg-background border-muted h-9 text-xs"
          />
        </div>
      </div>

      {/* Attachments Section */}
      <div className="grid gap-2 border-t border-dashed pt-3 mt-1">
        <Label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Paperclip className="h-3 w-3 text-primary" />
          Materials (Syllabus, Specs, etc.)
        </Label>
        
        <div className="flex flex-col gap-2">
          {files.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-1 max-h-[100px] overflow-y-auto pr-1">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border border-border group">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] truncate font-bold">{file.name}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="relative">
            <Input
              id="attachments-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 h-9 gap-2 font-bold"
              onClick={() => document.getElementById('attachments-input')?.click()}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase">Add Materials</span>
            </Button>
          </div>
        </div>
      </div>

      {state && (
        <p className="text-[10px] font-bold text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">{state}</p>
      )}
      <Button type="submit" disabled={isPending} className="w-full font-black uppercase tracking-widest h-11 shadow-lg shadow-primary/20 mt-1">
        {isPending ? "Orchestrating..." : "Launch Task"}
      </Button>
    </form>
  );
}
