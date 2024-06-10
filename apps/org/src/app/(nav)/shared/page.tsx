export default function Page() {
  return (
    <div className="my-8 flex-1 space-y-4 text-center">
      <p className="text-2xl font-semibold tracking-tight">
        This is a shared page.
      </p>
      <p className="text-muted-foreground">
        You can only see this if you are the{" "}
        <span className="text-foreground"> member </span> or{" "}
        <span className="text-foreground"> partner </span> of us
      </p>
    </div>
  );
}
