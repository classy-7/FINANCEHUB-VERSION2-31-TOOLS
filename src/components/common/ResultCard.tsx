import React from "react";

interface ResultCardProps {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "positive" | "warning" | "neutral" | "info";
  };
  highlight?: boolean;
  size?: "compact" | "normal" | "large";
}

export const ResultCard: React.FC<ResultCardProps> = ({
  id,
  title,
  value,
  subtitle,
  badge,
  highlight = false,
  size,
}) => {
  const badgeClasses = {
    positive: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    info: "bg-teal-50 text-teal-800 border-teal-200",
  }[badge?.variant || "neutral"];

  // Adaptive font sizing based on character length & highlight mode
  const getResponsiveValueSize = (val: string, isHighlight: boolean) => {
    const len = val.length;
    if (isHighlight || size === "large") {
      if (len > 24) return "text-sm sm:text-base lg:text-lg";
      if (len > 18) return "text-base sm:text-lg lg:text-xl";
      if (len > 13) return "text-xl sm:text-2xl lg:text-3xl";
      if (len > 9) return "text-2xl sm:text-3xl lg:text-4xl";
      return "text-3xl sm:text-4xl lg:text-5xl";
    }

    // Standard secondary metric cards (dense multi-column grids)
    if (len > 18) return "text-xs";
    if (len > 13) return "text-xs sm:text-sm";
    if (len > 10) return "text-sm sm:text-base";
    if (len > 7) return "text-base sm:text-lg";
    return "text-lg sm:text-xl";
  };

  return (
    <div
      id={id}
      className={`min-w-0 max-w-full overflow-hidden rounded-xl transition-all duration-150 border flex flex-col justify-between ${
        highlight
          ? "p-4 sm:p-5 lg:p-6 bg-teal-900 text-white border-teal-800 shadow-md"
          : "p-3 sm:p-3.5 lg:p-4 bg-white text-slate-900 border-slate-200/80 shadow-xs hover:border-slate-300"
      }`}
    >
      <div className="min-w-0 flex items-center justify-between gap-1.5 mb-1.5">
        <span
          className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase truncate block ${
            highlight ? "text-teal-200" : "text-slate-500"
          }`}
          title={title}
        >
          {title}
        </span>
        {badge && (
          <span
            className={`text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
              highlight
                ? "bg-teal-800 text-teal-100 border-teal-700"
                : badgeClasses
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div
        className={`font-bold tracking-tight tabular-nums break-words leading-tight transition-all max-w-full ${
          highlight ? "text-white" : "text-slate-900"
        } ${getResponsiveValueSize(value, highlight)}`}
        title={value}
      >
        {value}
      </div>

      {subtitle && (
        <p
          className={`text-[11px] sm:text-xs mt-1.5 font-medium block leading-snug line-clamp-2 ${
            highlight ? "text-teal-200/90" : "text-slate-500"
          }`}
          title={subtitle}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
