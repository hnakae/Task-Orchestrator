import { DashboardButtons } from "./DashboardButtons";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <DashboardButtons />
      </div>

      {children}
    </div>
  );
}
