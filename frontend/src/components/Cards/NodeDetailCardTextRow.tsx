import React, { useRef, useState, useEffect } from "react";
import { Info } from "lucide-react";

const NodeDetailCardTextRow = ({
  title,
  value,
  unit,
  info,
}: {
  title: string;
  value: string;
  unit?: string;
  info?: string;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showTooltip && tooltipRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;

      // Position tooltip above the icon
      tooltip.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      tooltip.style.top = `${buttonRect.top - 8}px`;
    }
  }, [showTooltip]);

  return (
    <div className="flex flex-col w-full mb-2 my-2">
      <div className="flex items-center gap-1">
        <div className="font-semibold text-slate-700">{title}</div>
        {info && (
          <div className="relative inline-flex">
            <button
              ref={buttonRef}
              type="button"
              className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => e.preventDefault()}
            >
              <Info size={14} />
            </button>

            {showTooltip && (
              <div
                ref={tooltipRef}
                role="tooltip"
                className="fixed z-[9999] px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm"
                style={{
                  transform: "translate(-50%, -100%)",
                  width: "max-content",
                  maxWidth: "280px",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {info}
                <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="overflow-hidden whitespace-nowrap text-ellipsis text-slate-800 mt-1">
        {value ? `${value} ${unit || ""}` : "-"}
      </div>
    </div>
  );
};

export default NodeDetailCardTextRow;
