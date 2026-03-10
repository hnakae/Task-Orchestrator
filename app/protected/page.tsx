import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { getTasks } from "./actions";
import Dashboard from "./components/Dashboard";

async function ProtectedContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const result = await getTasks();
  const tasks = result.success ? result.data : [];

  return <Dashboard initialTasks={tasks} />;
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <ProtectedContent />
    </Suspense>
  );
}
