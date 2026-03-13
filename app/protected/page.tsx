import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { getTasks } from "./actions";
import Dashboard from "./components/Dashboard";
import { TaskList } from "./components/task-list";
import { DashboardSkeleton } from "./components/dashboard-skeleton";

async function TaskListContainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const result = await getTasks();
  const tasks = result.success ? result.data : [];

  return <TaskList initialTasks={tasks} />;
}

export default function ProtectedPage() {
  return (
    <Dashboard>
      <Suspense fallback={<DashboardSkeleton />}>
        <TaskListContainer />
      </Suspense>
    </Dashboard>
  );
}
