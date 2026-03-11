import Link from "next/link";
import { Button } from "./ui/button";
import { UserNav } from "./user-nav";
import type { User } from "@supabase/supabase-js";

export function AuthButton({ user }: { user: User | null }) {
  return user ? (
    <UserNav email={user.email!} />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"} className="px-4 font-semibold border-border/50 hover:bg-muted transition-colors">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="px-4 font-semibold shadow-sm">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
