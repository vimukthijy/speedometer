export type SpeedUnit = 'kmh' | 'mph';

export const metersPerSecondToKmh = (speed: number): number => {
  return speed * 3.6;
};

export const metersPerSecondToMph = (speed: number): number => {
  return speed * 2.236936;
};

export const convertSpeed = (speed: number, unit: SpeedUnit): number => {
  return unit === 'kmh'
    ? metersPerSecondToKmh(speed)
    : metersPerSecondToMph(speed);
};

export const formatSpeed = (speed: number, unit: SpeedUnit): string => {
  return convertSpeed(speed, unit).toFixed(1);
};
