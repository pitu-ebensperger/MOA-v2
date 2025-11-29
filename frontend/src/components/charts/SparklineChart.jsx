import PropTypes from "prop-types";
import { motion as Motion } from "framer-motion";

export const SparklineChart = ({
  data = [],
  width = 100,
  height = 40,
  color = "var(--color-primary1)",
  fillColor,
  strokeWidth = 2,
  animate = true,
  showDots = false,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center rounded-lg bg-(--color-neutral3)"
      >
        <span className="text-xs text-(--text-muted)">—</span>
      </div>
    );
  }

  const values = data.map((d) => (typeof d === "number" ? d : d.value || 0));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  // Calculate points for the line
  const padding = 4;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  // Create path for line
  const pathData = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return index === 0 ? `M ${x},${y}` : `L ${x},${y}`;
  }).join(" ");

  // Create area fill path
  const areaPathData = `${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Area fill with gradient */}
      {fillColor && (
        <defs>
          <linearGradient id={`gradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
          </linearGradient>
        </defs>
      )}
      
      {fillColor && (
        <Motion.path
          d={areaPathData}
          fill={`url(#gradient-${Math.random()})`}
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 1 } : false}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}

      {/* Main line */}
      <Motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : false}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Dots on data points */}
      {showDots && values.map((value, index) => {
        const x = padding + (index / (values.length - 1)) * effectiveWidth;
        const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
        return (
          <Motion.circle
            key={index}
            cx={x}
            cy={y}
            r={3}
            fill={color}
            initial={animate ? { scale: 0, opacity: 0 } : false}
            animate={animate ? { scale: 1, opacity: 1 } : false}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
          />
        );
      })}

      {/* Highlight last point */}
      <Motion.circle
        cx={padding + effectiveWidth}
        cy={padding + effectiveHeight - ((values.at(-1) - min) / range) * effectiveHeight}
        r={4}
        fill={color}
        initial={animate ? { scale: 0 } : false}
        animate={animate ? { scale: 1 } : false}
        transition={{ delay: 1, duration: 0.4, type: "spring" }}
      >
        <animate
          attributeName="r"
          values="4;6;4"
          dur="2s"
          repeatCount="indefinite"
        />
      </Motion.circle>
    </svg>
  );
};

SparklineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.shape({ value: PropTypes.number })])
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  fillColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  animate: PropTypes.bool,
  showDots: PropTypes.bool,
};
