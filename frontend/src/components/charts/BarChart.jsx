import PropTypes from 'prop-types';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

const DEFAULT_COLORS = [
  'var(--color-primary1)',
  'var(--color-secondary1)',
  'var(--color-primary2)',
  'var(--color-secondary2)',
  'var(--color-primary3)',
];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-neutral1) p-4 shadow-(--shadow-md)">
      <p className="mb-2 text-sm font-semibold text-(--text-strong)">{label}</p>
      {payload.map((entry, index) => (
        <div key={`tooltip-${index}`} className="flex items-center gap-2 text-sm">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: entry.fill || entry.color }}
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

export const BarChart = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  colors = DEFAULT_COLORS,
  tooltipFormatter,
  barSize,
  radius = [8, 8, 0, 0],
  layout = 'vertical',
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
      <RechartsBarChart data={data} layout={layout}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            opacity={0.3}
          />
        )}
        {layout === 'vertical' ? (
          <>
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
          </>
        ) : (
          <>
            <XAxis
              type="number"
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary1)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary1)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              width={120}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            formatter={(value) => <span className="text-sm text-(--text-strong)">{value}</span>}
          />
        )}
        {bars.map((bar, barIndex) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color || colors[barIndex % colors.length]}
            radius={radius}
            barSize={barSize}
          >
            {bar.useMultiColors && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      useMultiColors: PropTypes.bool,
    })
  ).isRequired,
  xAxisKey: PropTypes.string.isRequired,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  colors: PropTypes.array,
  tooltipFormatter: PropTypes.func,
  barSize: PropTypes.number,
  radius: PropTypes.arrayOf(PropTypes.number),
  layout: PropTypes.oneOf(['vertical', 'horizontal']),
};
