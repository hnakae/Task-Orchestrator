import Link from "next/link";
import { Button } from "./ui/button";

export function TasksButton() {
  return (
    <Link href="/protected">
      <Button className="flex items-center gap-2" size="sm">
        <span>View Tasks</span>
      </Button>
    </Link>
  );
}
