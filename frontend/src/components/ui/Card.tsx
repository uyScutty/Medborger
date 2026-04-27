import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={twMerge("rounded-xl border border-gray-200 bg-white shadow-sm", paddingClasses[padding], className)}
    >
      {children}
    </div>
  );
}
