import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
      <h2 className="border-border mb-4 border-b px-10 pb-4 font-sans text-2xl font-semibold">
        404 Not Found
      </h2>
      <div className="text-muted-foreground text-base">
        <span>Go to </span>
        <Link
          href="/"
          className="hover:text-primary underline underline-offset-4"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
