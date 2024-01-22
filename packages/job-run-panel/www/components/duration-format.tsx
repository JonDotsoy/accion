import { type FC } from "react";
import ms from "ms";

const unit = [
  ["millisecond", ms("1ms")],
  ["second", ms("1s")],
  ["minute", ms("1m")],
  ["hour", ms("1h")],
  ["day", ms("1d")],
] as const;

const createFormatterObject = (
  unitValue: (typeof unit)[number][0],
  ms: number,
) => {
  const numberFormat = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: unitValue,
    maximumFractionDigits: 0,
    compactDisplay: "short",
  });

  return {
    ms,
    numberFormat,
    format: (valueMs: number) => numberFormat.format(valueMs / ms),
  };
};

const formats = Object.fromEntries(
  unit.map(([unit, ms]) => [unit, createFormatterObject(unit, ms)]),
) as Record<(typeof unit)[number][0], ReturnType<typeof createFormatterObject>>;

export const durationFormat = (duration: number) => {
  const unitFound = unit.find(([], index, units) => {
    const nextUnit = units.at(index + 1);
    if (nextUnit && duration < nextUnit[1]) return true;
  });

  const format = unitFound ? formats[unitFound[0]] : formats["day"];

  return format.format(duration);
};

export const DurationFormat: FC<{
  /** value on millisecond */
  value: number;
}> = ({ value }) => {
  const dateTime = `${formats.millisecond.format(value)}`;
  return (
    <time title={dateTime} dateTime={dateTime}>
      {durationFormat(value)}
    </time>
  );
};
