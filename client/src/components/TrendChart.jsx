import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const dotColors = {
  normal: '#16a34a',
  high: '#ea580c',
  low: '#2563eb',
  unknown: '#6b7280',
};

const flagKeys = {
  normal: 'flagNormal',
  high: 'flagHigh',
  low: 'flagLow',
  unknown: 'flagUnknown',
};

const formatNumber = (number) => Number(number).toLocaleString('en-US');

function FlagDot({ cx, cy, payload }) {
  if (cx === undefined || cy === undefined || !payload) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={dotColors[payload.flag] || dotColors.unknown}
      stroke="#ffffff"
      strokeWidth={2}
    />
  );
}

function ChartTooltip({ active, payload, unit }) {
  const { t } = useLanguage();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="chart-tip">
      <strong>{point.date}</strong>
      <span>
        {formatNumber(point.value)} {unit || ''}
      </span>
      <em>{t(flagKeys[point.flag] || 'flagUnknown')}</em>
    </div>
  );
}

function TrendChart({ points, unit, label }) {
  const band = [...points]
    .reverse()
    .find((point) => point.refLow !== null || point.refHigh !== null);

  const numbers = points.map((point) => point.value);

  if (band) {
    if (band.refLow !== null) {
      numbers.push(band.refLow);
    }
    if (band.refHigh !== null) {
      numbers.push(band.refHigh);
    }
  }

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const pad = (max - min) * 0.15 || Math.max(Math.abs(max) * 0.1, 1);
  const yMin = min >= 0 ? Math.max(0, min - pad) : min - pad;
  const yMax = max + pad;

  return (
    <div className="chart-box" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={points}
          margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {band && (
            <ReferenceArea
              y1={band.refLow !== null ? band.refLow : yMin}
              y2={band.refHigh !== null ? band.refHigh : yMax}
              fill="#16a34a"
              fillOpacity={0.12}
            />
          )}
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatNumber(Math.round(value * 10) / 10)}
            width={70}
            allowDecimals
          />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          <Line
            type="linear"
            dataKey="value"
            stroke="#0b7f72"
            strokeWidth={3}
            dot={<FlagDot />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;