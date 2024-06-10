export function parseTimeToMilliSeconds(timeString: string) {
  const units: { [unit: string]: number } = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  };

  const regex = /^(\d+)([smhdw])$/;
  const match = regex.exec(timeString.toLowerCase());

  if (!match) {
    throw new Error("Invalid time string format");
  }

  const amount = parseInt(match[1]);
  const unit = match[2];

  return amount * (units[unit] || 60) * 1000;
}
