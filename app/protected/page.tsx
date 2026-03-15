import { getTasks } from "./actions";
import Dashboard from "./components/Dashboard";
import { TaskList } from "./components/task-list";

export default function ProtectedPage() {
  const tasksPromise = getTasks();

  return (
    <Dashboard>
      <TaskList initialTasksPromise={tasksPromise} />
    </Dashboard>
  );
}
