import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Footer() {
  return (
    <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
      <p>
        Created by{" "}
        <a
          href="https://portfolio-2023-murex.vercel.app/"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Hiro Nakae
        </a>
      </p>
      <ThemeSwitcher />
    </footer>
  );
}
