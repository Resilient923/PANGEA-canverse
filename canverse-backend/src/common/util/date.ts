interface UtcDatetime {
  year: string;
  month: string;
  day: string;
  epoch: number;
}

export function getNow(): UtcDatetime {
  const now = new Date();
  return {
    year: now.getUTCFullYear().toString(),
    month: (now.getUTCMonth() + 1).toString().padStart(2, '0'),
    day: now.getUTCDate().toString().padStart(2, '0'),
    epoch: now.getTime(),
  };
}
