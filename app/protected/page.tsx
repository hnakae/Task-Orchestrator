import { Suspense } from "react";
import { getTasks } from "./actions";
import Dashboard from "./components/Dashboard";
import { TaskList } from "./components/task-list";
import { DashboardSkeleton } from "./components/dashboard-skeleton";

async function TaskListWrapper() {
  // We await it here on the server to handle the promise resolution
  const result = await getTasks();
  
  // Pass the resolved data directly to avoid client-side promise serialization issues
  return <TaskList initialResult={result} />;
}

export default function ProtectedPage() {
  return (
    <Dashboard>
      <Suspense fallback={<DashboardSkeleton />}>
        <TaskListWrapper />
      </Suspense>
    </Dashboard>
  );
}
