import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "./actions";
import { TaskList } from "./task-list";
import { TaskCreateForm } from "./task-create-form";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const result = await getTasks();
  const tasks = result.success ? result.data : [];

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="font-bold text-2xl">Tasks</h1>
      <TaskCreateForm />
      <TaskList initialTasks={tasks} />
    </div>
  );
}
