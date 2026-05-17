export const formatIsoDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const nowUtc = (): Date => new Date(Date.now());
