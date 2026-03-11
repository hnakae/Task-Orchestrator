import { CheckSquare } from "lucide-react";
import { NextLogo } from "./next-logo";
import { SupabaseLogo } from "./supabase-logo";

export function Hero() {
  return (
    <div className="flex flex-col gap-12 items-center py-12 px-4">
      <div className="relative group">
        <div className="absolute -inset-6 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
        <div className="relative bg-primary p-5 rounded-2xl shadow-2xl shadow-primary/20 transform group-hover:scale-105 transition-transform duration-300">
          <CheckSquare className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>
      
      <div className="flex flex-col gap-4 items-center text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent pb-2 leading-tight">
          Orchestrate Your Tasks
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
          The ultimate productivity companion to manage your daily workflow with precision and style. Built for focus and efficiency.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Powering your productivity with
        </p>
        <div className="flex gap-10 justify-center items-center opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            rel="noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <SupabaseLogo />
          </a>
          <span className="h-6 w-[1px] bg-border rotate-12" />
          <a 
            href="https://nextjs.org/" 
            target="_blank" 
            rel="noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <NextLogo />
          </a>
        </div>
      </div>

      <div className="w-full max-w-md p-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-8" />
    </div>
  );
}
