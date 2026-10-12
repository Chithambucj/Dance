import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse [animation-duration:2.6s] rounded-xl bg-gray-200/75 dark:bg-gray-800/75",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
