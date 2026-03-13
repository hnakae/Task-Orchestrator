"use client";

import { useState, useEffect, useMemo } from "react";
import { getCourses, createCourse, updateCourse, deleteCourse } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  BookOpen, 
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
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

type RubricItem = {
  id: string;
  label: string;
  weight: number;
};

export function CourseManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [courseName, setCourseName] = useState("");
  const [rubricItems, setRubricItems] = useState<RubricItem[]>([]);

  const loadCourses = async () => {
    setIsLoading(true);
    const res = await getCourses();
    if (res.success) {
      setCourses(res.data);
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const totalWeight = useMemo(() => 
    rubricItems.reduce((acc, item) => acc + item.weight, 0),
    [rubricItems]
  );

  const startAdding = () => {
    setCourseName("");
    setRubricItems([
      { id: "HOMEWORK", label: "Homework", weight: 20 },
      { id: "QUIZ", label: "Quizzes", weight: 10 },
      { id: "MIDTERM1", label: "Midterm 1", weight: 15 },
      { id: "MIDTERM2", label: "Midterm 2", weight: 15 },
      { id: "FINAL", label: "Final Exam", weight: 25 },
      { id: "PROJECT", label: "Project", weight: 15 },
    ]);
    setIsAdding(true);
    setEditingId(null);
  };

  const startEditing = (course: any) => {
    setCourseName(course.name);
    const rubric = (course.rubric || {}) as Record<string, number>;
    const items = Object.entries(rubric).map(([id, weight]) => ({
      id,
      label: id.charAt(0) + id.slice(1).toLowerCase().replace(/_/g, " "),
      weight
    }));
    setRubricItems(items);
    setEditingId(course.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const addRubricSection = () => {
    const newId = `SECTION_${Date.now()}`;
    setRubricItems([...rubricItems, { id: newId, label: "New Section", weight: 0 }]);
  };

  const updateRubricItem = (index: number, field: keyof RubricItem, value: any) => {
    const newItems = [...rubricItems];
    if (field === 'weight') {
      newItems[index].weight = Number(value);
    } else if (field === 'label') {
      newItems[index].label = value;
    }
    setRubricItems(newItems);
  };

  const deleteRubricItem = (index: number) => {
    setRubricItems(rubricItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!courseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }
    if (totalWeight !== 100) {
      toast.error(`Total weight must be exactly 100% (currently ${totalWeight}%)`);
      return;
    }

    const rubricMap: Record<string, number> = {};
    rubricItems.forEach(item => {
      const id = item.id.startsWith("SECTION_") 
        ? item.label.toUpperCase().replace(/\s+/g, "_") 
        : item.id;
      rubricMap[id] = item.weight;
    });

    if (editingId) {
      const res = await updateCourse(editingId, courseName, rubricMap);
      if (res.success) {
        toast.success("Course updated");
        setEditingId(null);
        loadCourses();
      } else {
        toast.error(res.error);
      }
    } else {
      const res = await createCourse(courseName, rubricMap);
      if (res.success) {
        toast.success("Course created");
        setIsAdding(false);
        loadCourses();
      } else {
        toast.error(res.error);
      }
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const res = await deleteCourse(id);
    if (res.success) {
      toast.success("Course deleted");
      loadCourses();
    } else {
      toast.error(res.error);
    }
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!isAdding && !editingId ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Courses</h3>
            <Button onClick={startAdding} size="sm" className="gap-2 font-bold h-8">
              <PlusCircle className="h-4 w-4" />
              New Course
            </Button>
          </div>

          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-xl border border-dashed border-border gap-3 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground opacity-20" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-muted-foreground">No courses tracked yet</p>
                <p className="text-[10px] text-muted-foreground/60 uppercase font-black">Define your classes to unlock advanced tracking</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {courses.map(course => (
                <Card key={course.id} className="group hover:border-primary/40 transition-colors shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-sm">{course.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                          {Object.keys(course.rubric || {}).length} rubric sections defined
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEditing(course)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the course. This action may fail if tasks are still linked to this course.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete Course
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-4 border-b bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              {editingId ? <Edit2 className="h-4 w-4 text-primary" /> : <PlusCircle className="h-4 w-4 text-primary" />}
              {editingId ? "Edit Course" : "Create New Course"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="course-name-field" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course Identity</Label>
              <Input 
                id="course-name-field" 
                placeholder="e.g. CS101: Introduction to AI" 
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="font-bold h-10"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label id="manager-rubric-label" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Grading Rubric</Label>
                  <Button 
                    type="button" 
                    variant="secondary"
                    size="icon"
                    onClick={addRubricSection}
                    className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    aria-labelledby="manager-rubric-label"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Badge variant={totalWeight === 100 ? "default" : "destructive"} className="text-[10px] font-black tracking-widest h-5">
                  TOTAL: {totalWeight}%
                </Badge>
              </div>

              <div className="grid gap-2.5" role="group" aria-labelledby="manager-rubric-label">
                {rubricItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                    <Input
                      id={`manager-rubric-label-${item.id}`}
                      aria-label={`Rubric item ${index + 1} name`}
                      className="h-9 text-xs font-bold flex-1 bg-muted/20 border-muted"
                      value={item.label}
                      onChange={(e) => updateRubricItem(index, "label", e.target.value)}
                      placeholder="Section Name"
                    />
                    <div className="flex items-center gap-2 w-20 shrink-0">
                      <Input
                        id={`manager-rubric-weight-${item.id}`}
                        aria-label={`Rubric item ${index + 1} weight percentage`}
                        type="number"
                        min={0}
                        max={100}
                        className="h-9 text-right pr-2 text-xs font-black"
                        value={item.weight}
                        onChange={(e) => updateRubricItem(index, "weight", e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground font-bold">%</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => deleteRubricItem(index)}
                      aria-label={`Delete rubric item ${item.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {totalWeight !== 100 && (
                <div className="flex items-center gap-2 p-2 bg-destructive/5 rounded-lg border border-destructive/10 text-destructive mt-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-tight leading-none">
                    Weights must add up to exactly 100% to save
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-2 pb-6 px-6">
            <Button variant="ghost" size="sm" onClick={cancelForm} className="font-bold uppercase tracking-widest text-[10px]">
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={totalWeight !== 100}
              className="font-bold uppercase tracking-widest text-[10px] h-9 px-6 shadow-lg shadow-primary/20"
            >
              <Save className="h-3.5 w-3.5 mr-2" />
              {editingId ? "Update Course" : "Save Course"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
