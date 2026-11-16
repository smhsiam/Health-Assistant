const { findTest, normalizeName, normalizeUnit } = require('./ruleEngine');

const STABLE_PERCENT = 5;

const round = (number) => Math.round(number * 1e6) / 1e6;

const toNumber = (input) =>
  input === null || input === undefined ? null : Number(input);

const keyFor = (name, unit) => {
  const test = findTest(name);
  const base = test
    ? test.key
    : `x_${normalizeName(name).replace(/ /g, '_')}`.slice(0, 100);
  const unitPart = normalizeUnit(unit).replace(/[^a-z0-9]+/g, '_') || 'none';
  return `${base}__${unitPart}`.slice(0, 200);
};

const toPoint = (row) => ({
  id: row.id,
  reportId: row.report_id,
  date: row.point_date,
  testName: row.test_name,
  value: toNumber(row.value),
  unit: row.unit,
  refLow: toNumber(row.ref_low),
  refHigh: toNumber(row.ref_high),
  flag: row.flag,
  isCritical: row.is_critical,
});

const groupRows = (rows) => {
  const groups = Object.create(null);

  rows.forEach((row) => {
    const key = keyFor(row.test_name, row.unit);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(toPoint(row));
  });

  return groups;
};

const summarize = (groups) =>
  Object.keys(groups)
    .map((key) => {
      const points = groups[key];
      const last = points[points.length - 1];

      return {
        key,
        name: last.testName,
        unit: last.unit,
        count: points.length,
        latestFlag: last.flag,
        latestCritical: last.isCritical,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

const percentOf = (change, base) =>
  base === 0 ? null : (change / Math.abs(base)) * 100;

const isSmall = (change, base) => {
  const percent = percentOf(change, base);
  return percent === null ? change === 0 : Math.abs(percent) < STABLE_PERCENT;
};

const distanceOutside = (point) => {
  if (point.refLow === null && point.refHigh === null) {
    return null;
  }

  if (point.refLow !== null && point.value < point.refLow) {
    return round(point.refLow - point.value);
  }

  if (point.refHigh !== null && point.value > point.refHigh) {
    return round(point.value - point.refHigh);
  }

  return 0;
};

const analyze = (points) => {
  const count = points.length;

  if (count < 2) {
    return { status: 'not_enough', count };
  }

  const values = points.map((point) => point.value);
  const first = values[0];
  const last = values[count - 1];
  const change = round(last - first);
  const diffs = values
    .slice(1)
    .map((value, index) => round(value - values[index]));

  const netSmall = isSmall(change, first);
  const stepsSmall = diffs.every((diff, index) => isSmall(diff, values[index]));

  let direction = 'mixed';

  if (netSmall && stepsSmall) {
    direction = 'stable';
  } else if (!netSmall && diffs.every((diff) => diff > 0)) {
    direction = 'rising';
  } else if (!netSmall && diffs.every((diff) => diff < 0)) {
    direction = 'falling';
  }

  const firstDistance = distanceOutside(points[0]);
  const lastDistance = distanceOutside(points[count - 1]);
  let rangeMove = null;

  if (firstDistance !== null && lastDistance !== null) {
    if (firstDistance === 0 && lastDistance === 0) {
      rangeMove = 'within';
    } else if (lastDistance < firstDistance) {
      rangeMove = 'closer';
    } else if (lastDistance > firstDistance) {
      rangeMove = 'further';
    } else {
      rangeMove = 'same';
    }
  }

  const percent = percentOf(change, first);
  const lastPoint = points[count - 1];

  return {
    status: 'ok',
    count,
    enoughForTrend: count >= 3,
    direction,
    firstValue: first,
    lastValue: last,
    firstDate: points[0].date,
    lastDate: lastPoint.date,
    change,
    percent: percent === null ? null : Math.round(percent * 10) / 10,
    rangeMove,
    latestFlag: lastPoint.flag,
    latestCritical: lastPoint.isCritical,
  };
};

module.exports = { groupRows, summarize, analyze };