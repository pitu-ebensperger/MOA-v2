import PropTypes from 'prop-types';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DEFAULT_COLORS = [
  'var(--color-primary1)',
  'var(--color-secondary1)',
  'var(--color-primary2)',
  'var(--color-secondary2)',
  'var(--color-success)',
  'var(--color-warning)',
];

const CustomTooltip = ({ active, payload, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-neutral1) p-4 shadow-(--shadow-md)">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="text-sm font-semibold text-(--text-strong)">{data.name}</span>
      </div>
      <p className="mt-2 text-sm text-(--text-secondary1)">
        <span className="font-semibold text-(--text-strong)">
          {formatter ? formatter(data.value) : data.value}
        </span>
        {data.payload.percentage && ` (${data.payload.percentage}%)`}
      </p>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  formatter: PropTypes.func,
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PieChart = ({
  data,
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showLabels = true,
  tooltipFormatter,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 2,
  legendRenderer, // optional custom legend renderer
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
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderLabel : false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          paddingAngle={paddingAngle}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
        {showLegend && !legendRenderer && (
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="circle"
            wrapperStyle={{ paddingLeft: '20px' }}
            formatter={(value, entry) => (
              <span className="text-sm text-(--text-strong)">
                {value}
                {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
              </span>
            )}
          />
        )}
        {legendRenderer && legendRenderer(data)}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.array,
  showLegend: PropTypes.bool,
  showLabels: PropTypes.bool,
  tooltipFormatter: PropTypes.func,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  paddingAngle: PropTypes.number,
  legendRenderer: PropTypes.func,
};
