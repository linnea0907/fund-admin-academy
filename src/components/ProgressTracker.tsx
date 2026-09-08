interface ProgressTrackerProps {
  /** 0-100 */
  percent: number;
  /** 环直径（px） */
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

/** 环形进度指示器 */
export default function ProgressTracker({
  percent,
  size = 96,
  strokeWidth = 10,
  label,
  sublabel,
}: ProgressTrackerProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#0e2a5e"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 500ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[#0e2a5e]">{clamped}%</span>
        </div>
      </div>
      {(label || sublabel) && (
        <div className="min-w-0">
          {label && <p className="text-sm font-semibold text-slate-800">{label}</p>}
          {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
