import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Footer() {
  return (
    <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-sm gap-8 py-12">
      <p className="text-muted-foreground">
        Created by{" "}
        <a
          href="https://portfolio-2023-murex.vercel.app/"
          target="_blank"
          className="font-bold text-primary hover:underline transition-all"
          rel="noreferrer"
        >
          Hiro Nakae
        </a>
      </p>
      <div className="flex items-center gap-4">
        <span className="h-4 w-[1px] bg-border" />
        <ThemeSwitcher />
      </div>
    </footer>
  );
}
