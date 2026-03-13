import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function NavContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 group">
          <div className="bg-primary p-1.5 rounded-md group-hover:shadow-[0_0_10px_rgba(5,175,242,0.5)] transition-shadow">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            TaskOrchestrator
          </span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-6">
            <Link 
              href="/protected" 
              className="text-sm font-semibold text-muted-foreground transition-all hover:text-primary relative group/link px-1 py-0.5"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <AuthButton user={user} />
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-muted p-1.5 rounded-md">
                <div className="h-5 w-5" />
              </div>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        }>
          <NavContent />
        </Suspense>
      </div>
    </nav>
  );
}
