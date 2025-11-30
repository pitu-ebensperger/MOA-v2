import PropTypes from 'prop-types';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DEFAULT_COLORS = {
  primary: 'var(--color-primary1)',
  secondary: 'var(--color-secondary1)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
};

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-neutral1) p-4 shadow-(--shadow-md)">
      <p className="mb-2 text-sm font-semibold text-(--text-strong)">{label}</p>
      {payload.map((entry, index) => (
        <div key={`tooltip-${index}`} className="flex items-center gap-2 text-sm">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.stroke || entry.color }}
          />
          <span className="text-(--text-secondary1)">{entry.name}:</span>
          <span className="font-semibold text-(--text-strong)">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  formatter: PropTypes.func,
};

export const AreaChart = ({
  data,
  areas,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  colors = DEFAULT_COLORS,
  tooltipFormatter,
  strokeWidth = 2,
  curve = 'monotone',
  fillOpacity = 0.3,
  stacked = false,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-(--color-neutral2)"
        style={{ height }}
      >
        <p className="text-sm text-(--text-muted)">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-secondary1)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <YAxis
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-secondary1)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            formatter={(value) => <span className="text-sm text-(--text-strong)">{value}</span>}
          />
        )}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type={curve}
            dataKey={area.dataKey}
            name={area.name || area.dataKey}
            stroke={area.strokeColor || Object.values(colors)[index % Object.values(colors).length]}
            fill={area.fillColor || Object.values(colors)[index % Object.values(colors).length]}
            strokeWidth={strokeWidth}
            fillOpacity={fillOpacity}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

AreaChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      strokeColor: PropTypes.string,
      fillColor: PropTypes.string,
    })
  ).isRequired,
  xAxisKey: PropTypes.string.isRequired,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  colors: PropTypes.object,
  tooltipFormatter: PropTypes.func,
  strokeWidth: PropTypes.number,
  curve: PropTypes.oneOf(['basis', 'linear', 'monotone', 'natural', 'step']),
  fillOpacity: PropTypes.number,
  stacked: PropTypes.bool,
};
