import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface NumberSliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  helperText?: string;
  disabled?: boolean;
}

export const NumberSliderInput: React.FC<NumberSliderInputProps> = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  tooltip,
  helperText,
  disabled = false,
}) => {
  const [textValue, setTextValue] = useState<string>(String(value));
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, "");
    setTextValue(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max * 1.5, Math.max(min, parsed));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(textValue);
    if (isNaN(parsed) || parsed < min) {
      onChange(min);
      setTextValue(String(min));
    } else if (parsed > max) {
      onChange(max);
      setTextValue(String(max));
    } else {
      setTextValue(String(parsed));
    }
  };

  // Calculate percentage fill for custom slider appearance
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div id={`${id}-wrapper`} className="space-y-1.5 py-2">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 relative min-w-0 flex-1">
          <label htmlFor={id} className="text-sm font-semibold text-slate-800 select-none truncate sm:whitespace-normal">
            {label}
          </label>
          {tooltip && (
            <div className="relative inline-block shrink-0">
              <button
                type="button"
                id={`${id}-info-btn`}
                aria-label={`More info about ${label}`}
                className="text-slate-400 hover:text-teal-700 transition-colors focus:outline-none"
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div
                  id={`${id}-tooltip`}
                  role="tooltip"
                  className="absolute z-30 left-0 top-6 w-60 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-800 leading-relaxed pointer-events-none"
                >
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Numeric text input with optional prefix/suffix */}
        <div className="relative flex items-center w-32 sm:w-36 shrink-0">
          {prefix && (
            <span className="absolute left-2.5 sm:left-3 text-xs sm:text-sm font-medium text-slate-400 select-none pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            type="text"
            id={id}
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`w-full text-right font-medium text-xs sm:text-sm text-slate-900 bg-white border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 focus:outline-none transition-all tabular-nums shadow-xs ${
              prefix ? (prefix.length > 2 ? "pl-9" : prefix.length > 1 ? "pl-8" : "pl-6 sm:pl-7") : "pl-2.5 sm:pl-3"
            } ${
              suffix
                ? suffix.length > 4
                  ? "pr-16"
                  : suffix.length > 2
                  ? "pr-11"
                  : "pr-7 sm:pr-8"
                : "pr-2.5 sm:pr-3"
            }`}
          />
          {suffix && (
            <span className="absolute right-2.5 sm:right-3 text-[11px] sm:text-xs font-semibold text-slate-400 select-none pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Synchronized Slider */}
      <div className="pt-1">
        <input
          type="range"
          id={`${id}-slider`}
          aria-label={`${label} slider`}
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={handleSliderChange}
          disabled={disabled}
          style={{
            background: `linear-gradient(to right, #0f766e 0%, #0f766e ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`,
          }}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-1 select-none tabular-nums">
          <span>
            {prefix}
            {min.toLocaleString()}
            {suffix}
          </span>
          <span>
            {prefix}
            {max.toLocaleString()}
            {suffix}
          </span>
        </div>
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
