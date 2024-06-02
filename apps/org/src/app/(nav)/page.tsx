import { publicEnv } from "@/lib/env/public";
import { cn } from "@/lib/utils/shadcn";

export default function Home() {
  return (
    <div className="relative grid flex-1 content-center justify-items-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        <p
          className={cn(
            "dark:from-foreground dark:to-muted-foreground from-muted-foreground to-foreground inline bg-gradient-to-b from-10% to-40% bg-clip-text text-transparent dark:from-40% dark:to-90%",
            "z-20 ml-2 font-serif text-[12rem] ",
          )}
        >
          {publicEnv.NEXT_PUBLIC_NAME}
        </p>
        <span className="dark:from-foreground dark:to-muted-foreground from-muted-foreground to-foreground inline bg-gradient-to-b from-10% to-40% bg-clip-text text-transparent dark:from-40% dark:to-90%">
          .Org
        </span>
      </h1>
      <p className="text-muted-foreground mb-12 text-base lg:text-lg ">
        Connecting the World, Empowering Innovation
      </p>
      <button className="border-primary bg-primary text-primary-foreground mx-auto block rounded-3xl border-2 font-semibold transition-all duration-300 hover:rounded-sm">
        <a href="/auth" className="block px-6 py-2">
          Join us
        </a>
      </button>
    </div>
  );
}
