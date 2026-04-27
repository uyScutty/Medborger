interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: "red" | "navy" | "green" | "amber";
  showValue?: boolean;
}

const colorClasses = {
  red: "bg-brand-red",
  navy: "bg-brand-navy",
  green: "bg-green-500",
  amber: "bg-amber-500",
};

export function ProgressBar({ value, max = 100, label, color = "red", showValue = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1 flex justify-between text-sm text-gray-600">
          {label && <span>{label}</span>}
          {showValue && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${pct}%` }}
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
}
