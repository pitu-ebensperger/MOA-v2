import PropTypes from "prop-types";
import { motion as Motion } from "framer-motion";
import { useMemo } from "react";

export const HeatMapChart = ({
  data = [],
  xLabels = [],
  yLabels = [],
  colorScale = ["#FAF8F5", "#C9A88A", "#A67B5B", "#6B5444", "#52443A"],
  showValues = false,
  cellSize = 40,
  gap = 2,
  animate = true,
}) => {
  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    return Math.max(...data.flat().map(d => d.value || 0));
  }, [data]);

  // Get color based on value
  const getColor = (value) => {
    if (value === 0) return colorScale[0];
    const percentage = value / maxValue;
    const index = Math.min(Math.floor(percentage * (colorScale.length - 1)) + 1, colorScale.length - 1);
    return colorScale[index];
  };

  // Format value for display
  const formatValue = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  const width = xLabels.length * (cellSize + gap) + 60;
  const height = yLabels.length * (cellSize + gap) + 40;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="select-none">
        {/* Y-axis labels */}
        {yLabels.map((label, yIndex) => (
          <text
            key={`y-${yIndex}`}
            x={50}
            y={yIndex * (cellSize + gap) + cellSize / 2 + 35}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-(--text-secondary1)"
          >
            {label}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, xIndex) => (
          <text
            key={`x-${xIndex}`}
            x={xIndex * (cellSize + gap) + cellSize / 2 + 60}
            y={20}
            textAnchor="middle"
            className="text-xs fill-(--text-secondary1)"
          >
            {label}
          </text>
        ))}

        {/* Heatmap cells */}
        {data.map((row, yIndex) =>
          row.map((cell, xIndex) => {
            const value = cell.value || 0;
            const color = getColor(value);
            const x = xIndex * (cellSize + gap) + 60;
            const y = yIndex * (cellSize + gap) + 30;

            return (
              <g key={`cell-${yIndex}-${xIndex}`}>
                <Motion.rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={6}
                  fill={color}
                  initial={animate ? { opacity: 0, scale: 0 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  transition={{
                    delay: animate ? (yIndex * xLabels.length + xIndex) * 0.02 : 0,
                    duration: 0.3,
                  }}
                  className="cursor-pointer transition-shadow hover:drop-shadow-lg"
                />

                {/* Value text */}
                {showValues && value > 0 && (
                  <Motion.text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none text-xs font-semibold"
                    fill={value > maxValue * 0.5 ? "white" : "var(--text-strong)"}
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: animate ? (yIndex * xLabels.length + xIndex) * 0.02 + 0.2 : 0,
                      duration: 0.3,
                    }}
                  >
                    {formatValue(value)}
                  </Motion.text>
                )}

                {/* Tooltip-like title */}
                <title>
                  {yLabels[yIndex]} - {xLabels[xIndex]}: {value}
                </title>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

HeatMapChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number,
      })
    )
  ).isRequired,
  xLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  yLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  colorScale: PropTypes.arrayOf(PropTypes.string),
  showValues: PropTypes.bool,
  cellSize: PropTypes.number,
  gap: PropTypes.number,
  animate: PropTypes.bool,
};
