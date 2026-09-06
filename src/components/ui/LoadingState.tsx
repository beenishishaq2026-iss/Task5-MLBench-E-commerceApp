export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div
      className={`${className} animate-spin rounded-full border-2 border-brass/30 border-t-rust`}
    />
  );
}

export default function LoadingState({
  message,
  minHeight = "min-h-[60vh]",
}: {
  message?: string;
  minHeight?: string;
}) {
  return (
    <div className={`flex ${minHeight} flex-col items-center justify-center gap-3`}>
      <Spinner />
      {message && <p className="text-sm text-ink/60">{message}</p>}
    </div>
  );
}